#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import sys
import asyncio
import logging
import json
import unicodedata
from datetime import datetime
from pathlib import Path
import requests
from bs4 import BeautifulSoup
import re
from jinja2 import Environment, select_autoescape
from pyppeteer import launch
from flask import Flask, jsonify, request
from flask_cors import CORS

# Logging setup
# Logging setup
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')


# HTML template with updated keys for easier Jinja access
TEMPLATE_HTML = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
    h1 { text-align: center; margin-bottom: 20px; }
    .section { margin-bottom: 30px; }
    .section h2 { font-size: 18px; border-bottom: 2px solid #333; padding-bottom: 5px; margin-bottom: 10px; }
    .match { background: #fff; padding: 15px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 15px; }
    .match-header { display: flex; justify-content: space-between; align-items: center; }
    .team { display: flex; align-items: center; flex: 1; }
    .team img { width: 24px; height: 24px; margin-right: 8px; }
    .team-name { font-weight: bold; }
    .score { font-size: 16px; font-weight: bold; width: 60px; text-align: center; }
    .time { font-size: 14px; color: #666; width: 60px; text-align: right; }
    .details { font-size: 12px; color: #444; margin-top: 8px; }
    .details span { display: inline-block; margin-right: 15px; }
  </style>
  <title>Jogos de {{ date_str }}</title>
</head>
<body>
  <h1>Jogos de {{ date_str }}</h1>
  {% for label, group in [
      ('Jogos em destaque', matches|selectattr('is_big')|list),
      ('Encerrados', matches|selectattr('status','equalto','3')|rejectattr('is_big')|list),
      ('Em andamento', matches|selectattr('status','equalto','2')|rejectattr('is_big')|list),
      ('Ainda por vir', matches|rejectattr('status','in',['2','3'])|rejectattr('is_big')|list)
    ] %}
    {% if group %}
    <div class="section">
      <h2>{{ label }}</h2>
      {% for m in group %}
      <div class="match">
        <div class="match-header">
          <div class="team">
            <img src="{{ m.team1.brasao }}" alt="{{ m.team1.nome }}" />
            <span class="team-name">{{ m.team1.nome }}</span>
          </div>
          <div class="score">
            {% if m.status in ['2','3'] %}{{ m.score1 }} - {{ m.score2 }}{% else %}-{% endif %}
          </div>
          <div class="team" style="justify-content: flex-end;">
            <span class="team-name">{{ m.team2.nome }}</span>
            <img src="{{ m.team2.brasao }}" alt="{{ m.team2.nome }}" />
          </div>
          <div class="time">{{ m.time }}</div>
        </div>
        <div class="details">
          <span>Estádio: {{ m.stadium or 'N/A' }}</span>
          <span>Canais: {{ m.channels | default('N/A') }}</span>
          <span>Status: {% if m.status=='2' %}Em andamento{% elif m.status=='3' %}Encerrado{% else %}Programado{% endif %}</span>
        </div>
      </div>
      {% endfor %}
    </div>
    {% endif %}
  {% endfor %}
</body>
</html>
"""

# Palavras-chave para identificar nomes de canais de transmissão
CHANNEL_KEYWORDS = [
    'globo', 'tv globo', 'sportv', 'premiere', 'ge tv', 'globoplay',
    'tnt', 'tnt sports', 'space', 'hbo max', 'max',
    'prime video', 'amazon', 'paramount+',
    'star+', 'disney+',
    'espn', 'espn 2', 'espn 3', 'espn 4', 'espn extra', 'fox sports',
    'dazn', 'eleven', 'elevensports', 'onefootball',
    'cazetv', 'caze tv', 'cazé tv', 'youtube', 'twitch',
    'xsports', 'sbt', 'record', 'band', 'bandsports'
]

def is_channel_name(text: str) -> bool:
    n = normalize(text)
    return any(kw in n for kw in CHANNEL_KEYWORDS)

def clean_channels_list(chans: list) -> list:
    out = []
    for c in chans:
        c = (c or '').strip()
        if not c:
            continue
        if is_channel_name(c):
            # evita duplicados case-insensitive
            if not any(c.lower() == o.lower() for o in out):
                out.append(c)
    return out

async def render_pdf(html_path: Path, pdf_path: Path):
    chrome_path = os.getenv('PUPPETEER_EXECUTABLE_PATH') or r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not Path(chrome_path).exists():
        logging.error(f"Chrome não encontrado em {chrome_path}.")
        sys.exit(1)
    browser = await launch(executablePath=chrome_path, args=['--no-sandbox','--headless'])
    page = await browser.newPage()
    await page.goto(html_path.resolve().as_uri(), {'waitUntil':'networkidle0'})
    await page.pdf({'path':str(pdf_path),'format':'A4','printBackground':True,'margin':{'top':'20px','bottom':'20px','left':'20px','right':'20px'}})
    await browser.close()

def fetch_matches(date_str: str) -> list:
    url = 'https://www.uol.com.br/esporte/service/?loadComponent=match-service&contentType=json'
    try:
        resp = requests.get(url, timeout=10); resp.raise_for_status()
        data = resp.json().get('matches',[])
    except Exception as e:
        logging.error(f"Erro API: {e}"); return []
    try:
        date_api = datetime.strptime(date_str,'%d-%m-%Y').strftime('%Y-%m-%d')
    except ValueError:
        logging.error("Data inválida. Use DD-MM-YYYY."); return []
    matches = []
    for d in data:
        if d.get('data')!=date_api: continue
        t1 = d.get('time1',{})
        t2 = d.get('time2',{})
        matches.append({
            'competition': d.get('competicao',''),
            'time':        d.get('hora',''),
            'team1':       {'nome':t1.get('nome-comum',''),    'brasao':t1.get('brasao','')},
            'team2':       {'nome':t2.get('nome-comum',''),    'brasao':t2.get('brasao','')},
            'score1':      str(d.get('placar1','')),
            'score2':      str(d.get('placar2','')),
            'status':      '3' if d.get('encerrado') else ('2' if d.get('ao-vivo') else '1'),
            'is_big':      d.get('isBigGame',False),
            # UOL JSON não fornece 'transmitions' de forma consistente, canais serão enriquecidos via scraping
            'channels':    '',
            'stadium':     d.get('estadio') or d.get('local','')
        })
    return matches

def _apply_cookie_headers(headers: dict) -> dict:
    """Aplica cabeçalhos úteis para parecer um navegador real."""
    base = {
        'User-Agent': ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                       'AppleWebKit/537.36 (KHTML, like Gecko) '
                       'Chrome/126.0 Safari/537.36'),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
    }
    base.update(headers or {})
    return base

def normalize(text: str) -> str:
    """Normaliza nome de time: remove acentos, minúsculas, colapsa espaços e remove pontuação."""
    if not text:
        return ''
    t = unicodedata.normalize('NFKD', text)
    t = ''.join(c for c in t if not unicodedata.combining(c))
    t = t.lower()
    # Mantém letras, números e espaços
    t = re.sub(r'[^a-z0-9\s]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def scrape_channels_from_central(sess: requests.Session, save_raw: bool = False, out_dir: Path = Path('.')) -> dict:
    """
    Extrai canais a partir de <div class="transmitions">...</div> no mesmo card do jogo.
    Retorna {(home, away): [canais]}.
    """
    url = 'https://www.uol.com.br/esporte/futebol/central-de-jogos/'
    headers = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-User': '?1',
    }
    headers = _apply_cookie_headers(headers)
    r = sess.get(url, headers=headers, timeout=20)
    r.raise_for_status()
    html = r.text
    if save_raw:
        try:
            (out_dir / 'central_de_jogos.html').write_text(html, encoding='utf-8')
        except Exception:
            pass

    soup = BeautifulSoup(html, 'html.parser')
    trans_blocks = soup.select('[class*="transmitions"]')
    # Fallback: tentar renderizar a página para capturar conteúdo dinâmico
    if len(trans_blocks) == 0:
        async def _render_central_html(u: str) -> str:
            chrome_path = os.getenv('PUPPETEER_EXECUTABLE_PATH') or r"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            browser = await launch(executablePath=chrome_path, args=['--no-sandbox','--headless'])
            page = await browser.newPage()
            await page.goto(u, {'waitUntil':'networkidle2'})
            try:
                await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
                await asyncio.sleep(1.0)
            except Exception:
                pass
            content = await page.content()
            await browser.close()
            return content
        try:
            html = asyncio.run(_render_central_html(url))
            soup = BeautifulSoup(html, 'html.parser')
        except Exception as e:
            logging.warning(f"Falha ao renderizar Central de Jogos: {e}")
            # mantém soup do requests
    result = {}

    # todo card pode ser article/div com classes variadas
    def is_card(tag):
        if not tag or not tag.has_attr('class'):
            return False
        cls = ' '.join(tag['class']).lower()
        return any(k in cls for k in ['match-card','placar-jogo','jogo-info','match'])

    for trans in soup.select('[class*="transmitions"], [class*="transmition"]'):
        # acha o container do card (subindo na árvore)
        card = trans
        max_up = 8
        steps = 0
        while card and not is_card(card) and steps < max_up:
            card = card.parent
            steps += 1

        if not card or not hasattr(card, 'select'):
            # fallback: tenta encontrar um possível card próximo
            candidates = []
            p = trans.parent
            for _ in range(3):
                if p and hasattr(p, 'select'):
                    candidates.append(p)
                p = getattr(p, 'parent', None)
            # escolhe o primeiro que contenha classes sugestivas
            for cand in candidates:
                classes = ' '.join(cand.get('class', [])).lower()
                if any(k in classes for k in ['card','match','placar','jogo','partida']):
                    card = cand
                    break
            if not card:
                card = trans

        # coleta times no card com seletores ampliados
        team_candidates = []
        selectors = [
            '.team .team-name', '.time-casa', '.time-fora', '.teamName', '.team-name',
            '[class*="team-name"]', '[class*="teamName"]', '[class*="time-casa"]', '[class*="time-fora"]',
            '[class*="mandante"]', '[class*="visitante"]', '[class*="home"]', '[class*="away"]', '[class*="club"]'
        ]
        for sel in selectors:
            for el in card.select(sel) if hasattr(card, 'select') else []:
                txt = (el.get_text() or '').strip()
                if txt:
                    team_candidates.append(txt)
        # tenta via atributos alt/title em imagens ou spans
        if len(team_candidates) < 2:
            for img in card.find_all('img') if hasattr(card, 'find_all') else []:
                for attr in ['alt','title']:
                    txt = (img.get(attr) or '').strip()
                    if txt:
                        team_candidates.append(txt)
                        if len(team_candidates) >= 2:
                            break
                if len(team_candidates) >= 2:
                    break

        # dedup mantendo ordem
        seen = set()
        teams = []
        for t in team_candidates:
            k = normalize(t)
            if k and k not in seen:
                seen.add(k)
                teams.append(t)

        if len(teams) < 2:
            # último fallback: procurar padrão "X x Y" ou "X vs Y" próximo ao bloco
            try:
                raw = trans.get_text(" ")
                m = re.search(r"([A-Za-zÀ-ÿ0-9\.\-\s]{3,})\s*(x|vs|vs\.)\s*([A-Za-zÀ-ÿ0-9\.\-\s]{3,})", raw, re.IGNORECASE)
                if m:
                    cand1 = m.group(1).strip()
                    cand2 = m.group(3).strip()
                    if cand1 and cand2:
                        teams = [cand1, cand2]
            except Exception:
                pass
        if len(teams) < 2:
            continue

        home = normalize(teams[0])
        away = normalize(teams[1])

        # canais dentro de .transmitions
        chans = []
        for a in trans.find_all('a'):
            txt = (a.get_text() or '').strip()
            if txt and txt.lower() not in (c.lower() for c in chans):
                chans.append(txt)

        chans = clean_channels_list(chans)
        if chans:
            result[(home, away)] = chans

    # logging amostral
    try:
        logging.info(f"Blocos de transmissão encontrados: {len(list(soup.select('[class*\\"transmitions\\"], [class*\\"transmition\\"]')))}")
        if result:
            sample = list(result.items())[:5]
            for (h, a), c in sample:
                logging.info(f"Transmissão pareada: {h} vs {a} -> {', '.join(c)}")
    except Exception:
        pass

    return result

def generate_html(matches: list, date_str: str, output_dir: Path) -> Path:
    env = Environment(autoescape=select_autoescape(['html']))
    template = env.from_string(TEMPLATE_HTML)
    html = template.render(matches=matches, date_str=date_str)
    path = output_dir/ f"jogos_{date_str}.html"
    path.write_text(html,encoding='utf-8')
    return path

def get_games_json(date_str: str = None) -> dict:
    """
    Retorna os jogos do dia em formato JSON para integração com o dashboard
    """
    if not date_str:
        date_str = datetime.now().strftime('%d-%m-%Y')
    
    logging.info(f"Buscando jogos para {date_str}...")
    matches = fetch_matches(date_str)
    # Scrape de canais da Central de Jogos
    channels_map = {}
    central_html = None
    try:
        sess = requests.Session()
        channels_map = scrape_channels_from_central(sess)
        logging.info(f"Canais mapeados na Central: {len(channels_map)}")
        # guarda html bruto para fallback aproximado
        try:
            rhtml = sess.get('https://www.uol.com.br/esporte/futebol/central-de-jogos/', timeout=20)
            if rhtml.ok:
                central_html = rhtml.text
        except Exception:
            pass
    except Exception as e:
        logging.warning(f"Falha ao coletar canais na Central: {e}")

    def extract_channels_near_teams(html: str, home: str, away: str) -> list:
        if not html or not home or not away:
            return []
        try:
            h = home.lower()
            a = away.lower()
            low = html.lower()
            # encontra índice dos nomes em qualquer ordem
            i1 = low.find(h)
            j1 = low.find(a, i1 + 1) if i1 != -1 else -1
            i2 = low.find(a)
            j2 = low.find(h, i2 + 1) if i2 != -1 else -1
            start = -1
            if i1 != -1 and j1 != -1:
                start = min(i1, j1)
            elif i2 != -1 and j2 != -1:
                start = min(i2, j2)
            if start == -1:
                return []
            # procura bloco transmitions após os nomes
            k = low.find('class="transmitions', start)
            if k == -1:
                k = low.find("class='transmitions", start)
            if k == -1:
                return []
            # extrai trecho razoável e captura anchors
            snippet = html[k:k+4000]
            soup_local = BeautifulSoup(snippet, 'html.parser')
            chans = []
            raw_chans = []
            for a_tag in soup_local.find_all('a'):
                txt = (a_tag.get_text() or '').strip()
                if txt and txt.lower() not in (c.lower() for c in raw_chans):
                    raw_chans.append(txt)
            return clean_channels_list(raw_chans)
        except Exception:
            return []
    
    # Processar dados para formato mais amigável ao dashboard
    games_data = {
        'date': date_str,
        'total_games': len(matches),
        'games': []
    }
    
    # Função auxiliar para casar nomes com variações simples
    def names_match(a: str, b: str) -> bool:
        if not a or not b:
            return False
        return a == b or a in b or b in a

    for match in matches:
        game = {
            'id': f"{match['team1']['nome']}_vs_{match['team2']['nome']}_{match['time']}",
            'time_casa': match['team1']['nome'],
            'time_fora': match['team2']['nome'],
            'horario': match['time'],
            'campeonato': match['competition'],
            'status': match['status'],
            'placar_casa': match['score1'] if match['status'] in ['2', '3'] else None,
            'placar_fora': match['score2'] if match['status'] in ['2', '3'] else None,
            'brasao_casa': match['team1']['brasao'],
            'brasao_fora': match['team2']['brasao'],
            'estadio': match['stadium'],
            'canais': match['channels'],
            'is_big_game': match['is_big'],
            'status_text': 'Em andamento' if match['status'] == '2' else 'Encerrado' if match['status'] == '3' else 'Programado'
        }
        # Enriquecer canais via Central (com tolerância a variações de nomes)
        n_home = normalize(game['time_casa'])
        n_away = normalize(game['time_fora'])
        chans = None
        # Primeiro tenta match direto
        key_home_away = (n_home, n_away)
        key_away_home = (n_away, n_home)
        chans = channels_map.get(key_home_away) or channels_map.get(key_away_home)
        # Se não achou, tenta por similaridade simples (substring)
        if not chans:
            for (h, w), c in channels_map.items():
                if names_match(n_home, h) and names_match(n_away, w):
                    chans = c
                    break
                if names_match(n_home, w) and names_match(n_away, h):
                    chans = c
                    break
        if not chans and central_html:
            # fallback aproximado por texto bruto
            chans = extract_channels_near_teams(central_html, game['time_casa'], game['time_fora'])
        if chans:
            chans = clean_channels_list(chans)
            if chans:
                game['canais'] = ' | '.join(chans)
        games_data['games'].append(game)
    
    # Ordenar jogos por horário
    games_data['games'].sort(key=lambda x: x['horario'])
    
    return games_data

def save_games_json(date_str: str = None, output_dir: Path = None) -> Path:
    """
    Salva os jogos em arquivo JSON para cache
    """
    if not date_str:
        date_str = datetime.now().strftime('%d-%m-%Y')
    if not output_dir:
        output_dir = Path('.')
    
    games_data = get_games_json(date_str)
    json_file = output_dir / f"jogos_{date_str}.json"
    
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(games_data, f, ensure_ascii=False, indent=2)
    
    logging.info(f"JSON salvo: {json_file}")
    return json_file

# Criar aplicação Flask para API
app = Flask(__name__)
CORS(app)  # Permitir requisições do frontend

@app.route('/api/jogos', methods=['GET'])
def api_jogos():
    """
    Endpoint para obter jogos do dia
    Parâmetros:
    - date: data no formato DD-MM-YYYY (opcional, padrão hoje)
    """
    date_param = request.args.get('date')
    if not date_param:
        date_param = datetime.now().strftime('%d-%m-%Y')
    
    try:
        games_data = get_games_json(date_param)
        return jsonify({
            'success': True,
            'data': games_data
        })
    except Exception as e:
        logging.error(f"Erro na API: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/jogos/hoje', methods=['GET'])
def api_jogos_hoje():
    """
    Endpoint específico para jogos de hoje
    """
    try:
        games_data = get_games_json()
        return jsonify({
            'success': True,
            'data': games_data
        })
    except Exception as e:
        logging.error(f"Erro na API: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/status', methods=['GET'])
def api_status():
    """
    Endpoint para verificar se a API está funcionando
    """
    return jsonify({
        'success': True,
        'message': 'API de Jogos funcionando',
        'timestamp': datetime.now().isoformat()
    })

def start_api_server(port: int = 5000, debug: bool = False):
    """
    Inicia o servidor da API
    """
    logging.info(f"Iniciando servidor da API na porta {port}...")
    app.run(host='0.0.0.0', port=port, debug=debug)

def main():
    parser = __import__('argparse').ArgumentParser(description='Gera PDF de jogos UOL ou inicia API')
    today = datetime.now().strftime('%d-%m-%Y')
    parser.add_argument('date', nargs='?', default=today, help='DD-MM-YYYY (padrão hoje)')
    parser.add_argument('--out', default='.', help='Diretório de saída')
    parser.add_argument('--api', action='store_true', help='Iniciar servidor da API')
    parser.add_argument('--port', type=int, default=5000, help='Porta da API (padrão 5000)')
    parser.add_argument('--json', action='store_true', help='Salvar apenas JSON (sem PDF)')
    args = parser.parse_args()
    
    if args.api:
        start_api_server(port=args.port, debug=True)
        return
    
    out = Path(args.out); out.mkdir(exist_ok=True)
    logging.info(f"Buscando jogos {args.date}...")
    matches = fetch_matches(args.date)
    if not matches: logging.warning('Nenhum jogo encontrado')
    
    if args.json:
        # Salvar apenas JSON
        save_games_json(args.date, out)
        return
    
    logging.info('Gerando HTML...')
    html_file = generate_html(matches,args.date,out)
    logging.info('Renderizando PDF...')
    pdf_file = out/ f"jogos_{args.date}.pdf"
    asyncio.run(render_pdf(html_file,pdf_file))
    logging.info(f"PDF gerado: {pdf_file}")
    
    # Também salvar JSON para cache
    save_games_json(args.date, out)

if __name__=='__main__':
    main()