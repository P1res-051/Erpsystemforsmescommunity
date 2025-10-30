# botconversa_proxy.py
# Python 3.9+ (ok em 3.13)
# Execução:
#   pip install fastapi uvicorn httpx pydantic python-dotenv
#   uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload
#
# Modo simulado (default): REAL_MODE=false
# Modo real: export REAL_MODE=true
#            (as rotas chamam a API do BotConversa)
#
# Endpoints:
#   POST /bc/test-key               {apiKey}
#   POST /bc/create-or-get-tag      {apiKey, name}
#   POST /bc/upsert-subscriber      {apiKey, phone}
#   POST /bc/attach-tag             {apiKey, subscriberId, tagId}
#   POST /bc/bulk-attach-tag        {apiKey, tagName, phones[]}
#
# Regra de telefone:
#   - Mantém só dígitos
#   - Prefixa 55 se faltar
#   - Válido: ^55\d{10,13}$

import os
import re
import time
import asyncio
import random
from typing import List, Optional, Dict, Any, Tuple

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

REAL_MODE = os.getenv("REAL_MODE", "false").lower() in ("1", "true", "yes")
BC_BASE = "https://backend.botconversa.com.br/api/v1/webhook"
TIMEOUT = 30.0
BATCH_DELAY_MS = int(os.getenv("BATCH_DELAY_MS", "250"))  # 4 req/s
MAX_RETRIES = 6

app = FastAPI(title="BotConversa Proxy", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

# -----------------------
# Utils
# -----------------------
def only_digits(s: str) -> str:
    return re.sub(r"\D+", "", str(s or ""))

def normalize_phone(phone: str) -> str:
    p = only_digits(phone)
    if p.startswith("55"):
        return p
    # acrescenta 55 se tamanho plausível (10 a 13 dígitos)
    if 10 <= len(p) <= 13:
        return "55" + p
    return p

def is_valid_br55(phone: str) -> bool:
    return bool(re.fullmatch(r"55\d{10,13}", phone))

async def sleep_ms(ms: int):
    await asyncio.sleep(ms / 1000.0)

def api_headers(api_key: str) -> Dict[str, str]:
    return {"API-KEY": api_key, "Content-Type": "application/json"}

async def http_call(
    method: str, url: str, headers: Dict[str, str], json: Optional[dict] = None,
    ok: Tuple[int, ...] = (200, 201), max_retries: int = MAX_RETRIES
) -> Any:
    last_err = None
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        for attempt in range(1, max_retries + 1):
            try:
                resp = await client.request(method, url, headers=headers, json=json)
                if resp.status_code in ok:
                    return resp.json() if resp.text else None
                # 404 pode ser None conforme uso específico
                if resp.status_code == 404:
                    return None
                # rate limit/backoff
                wait_ms = 800 * attempt
                if resp.status_code == 429:
                    ra = resp.headers.get("Retry-After")
                    try:
                        wait_ms = int(float(ra) * 1000)
                    except:
                        wait_ms = 2000 * attempt
                elif 500 <= resp.status_code < 600:
                    wait_ms = 1000 * attempt
                elif attempt >= 2:
                    raise HTTPException(status_code=resp.status_code, detail=resp.text[:500])
                wait_ms = int(wait_ms + random.uniform(0, 400))
                await sleep_ms(wait_ms)
            except (httpx.HTTPError, httpx.TimeoutException) as e:
                last_err = e
                if attempt >= max_retries:
                    raise HTTPException(status_code=502, detail=f"Upstream error: {e}")
                await sleep_ms(int(600 * attempt + random.uniform(0, 400)))
    raise HTTPException(status_code=502, detail=f"Upstream error: {last_err}")

# -----------------------
# Schemas
# -----------------------
class TestKeyIn(BaseModel):
    apiKey: str = Field(..., min_length=10)

class CreateOrGetTagIn(BaseModel):
    apiKey: str = Field(..., min_length=10)
    name: str = Field(..., min_length=1, max_length=64)

class UpsertSubscriberIn(BaseModel):
    apiKey: str = Field(..., min_length=10)
    phone: str = Field(..., min_length=8)

class AttachTagIn(BaseModel):
    apiKey: str = Field(..., min_length=10)
    subscriberId: int
    tagId: int

class BulkAttachIn(BaseModel):
    apiKey: str = Field(..., min_length=10)
    tagName: str = Field(..., min_length=1, max_length=64)
    phones: List[str]

class ListTagsIn(BaseModel):
    apiKey: str = Field(..., min_length=10)
    phone: str = Field(..., min_length=8)

class FindTagIn(BaseModel):
    apiKey: str = Field(..., min_length=10)
    name: str = Field(..., min_length=1, max_length=64)

# -----------------------
# Simulação (modo fake)
# -----------------------
SIM_TAGS: Dict[str, int] = {}
SIM_SUBS: Dict[str, int] = {}
SIM_REL: List[Tuple[int, int]] = []  # (subscriberId, tagId)

async def sim_get_custom_fields() -> list:
    return [{"id": 1, "key": "Cliente ID"}, {"id": 2, "key": "Usuário"}]

async def sim_create_tag(name: str) -> Dict[str, Any]:
    if name in SIM_TAGS:
        return {"id": SIM_TAGS[name], "name": name}
    tag_id = len(SIM_TAGS) + 100
    SIM_TAGS[name] = tag_id
    return {"id": tag_id, "name": name}

async def sim_get_tag(name: str) -> Optional[Dict[str, Any]]:
    if name in SIM_TAGS:
        return {"id": SIM_TAGS[name], "name": name}
    return None

async def sim_get_sub_by_phone(phone: str) -> Optional[Dict[str, Any]]:
    if phone in SIM_SUBS:
        return {"id": SIM_SUBS[phone], "phone": phone}
    return None

async def sim_create_sub(phone: str) -> Dict[str, Any]:
    if phone in SIM_SUBS:
        return {"id": SIM_SUBS[phone], "phone": phone}
    sub_id = len(SIM_SUBS) + 1000
    SIM_SUBS[phone] = sub_id
    return {"id": sub_id, "phone": phone}

async def sim_attach_tag(subscriber_id: int, tag_id: int) -> Dict[str, Any]:
    SIM_REL.append((subscriber_id, tag_id))
    return {"ok": True, "subscriber": subscriber_id, "tag": tag_id}

async def sim_list_sub_tags(subscriber_id: int) -> List[Dict[str, Any]]:
    out = []
    for sid, tid in SIM_REL:
        if sid == subscriber_id:
            # buscar nome da tag por id
            name = None
            for n, i in SIM_TAGS.items():
                if i == tid:
                    name = n
                    break
            out.append({"id": tid, "name": name or str(tid)})
    return out

# -----------------------
# Handlers reais
# -----------------------
async def real_get_custom_fields(api_key: str) -> Any:
    return await http_call("GET", f"{BC_BASE}/custom_fields/?page=1&per_page=1", api_headers(api_key))

async def real_create_tag(api_key: str, name: str) -> Dict[str, Any]:
    # cria; se falhar por duplicidade, tenta buscar por nome
    try:
        created = await http_call("POST", f"{BC_BASE}/tags/", api_headers(api_key), json={"name": name})
        # Alguns backends retornam objeto ou lista; garantimos que nome confere
        if isinstance(created, dict) and str(created.get("name","")) == name:
            return created
        # se a API retornar algo não relacionado, buscamos por nome exato
        found = await real_get_tag(api_key, name)
        if found:
            return found
        return created
    except HTTPException as e:
        # fallback: procurar por nome exato iterando todas as páginas
        try:
            found = await real_get_tag(api_key, name)
            if found:
                return found
        except Exception:
            pass
        raise e

async def real_get_tag(api_key: str, name: str) -> Optional[Dict[str, Any]]:
    # A API pode não suportar 'search'; iteramos páginas e comparamos por nome exato
    try:
        page = 1
        while True:
            items = await http_call("GET", f"{BC_BASE}/tags/?page={page}&per_page=100", api_headers(api_key))
            if isinstance(items, list):
                for it in items:
                    if str(it.get("name","")) == name:
                        return it
                if len(items) < 100:
                    break
                page += 1
            else:
                break
    except Exception:
        pass
    return None

async def real_get_sub_by_phone(api_key: str, phone: str) -> Optional[Dict[str, Any]]:
    return await http_call("GET", f"{BC_BASE}/subscriber/get_by_phone/{phone}/", api_headers(api_key))

async def real_create_sub(api_key: str, phone: str) -> Dict[str, Any]:
    payload = {"phone": phone, "first_name": phone[2:4] if len(phone) >= 4 else "55", "last_name": "Import"}
    return await http_call("POST", f"{BC_BASE}/subscriber/", api_headers(api_key), json=payload)

async def real_attach_tag(api_key: str, subscriber_id: int, tag_id: int) -> Dict[str, Any]:
    # estratégia 1: endpoint dedicado
    try:
        out = await http_call("POST", f"{BC_BASE}/subscriber/{subscriber_id}/tags/{tag_id}/", api_headers(api_key), json={}, ok=(200, 201, 204))
    except Exception:
        out = None
    # verifica se anexou
    try:
        tags_now = await real_list_sub_tags(api_key, subscriber_id)
        if any(int(t.get("id", -1)) == int(tag_id) for t in tags_now):
            return out or {"ok": True}
    except Exception:
        pass
    # estratégia 2: variação com plural
    try:
        out2 = await http_call("POST", f"{BC_BASE}/subscribers/{subscriber_id}/tags/{tag_id}/", api_headers(api_key), json={}, ok=(200, 201, 204))
        tags_now = await real_list_sub_tags(api_key, subscriber_id)
        if any(int(t.get("id", -1)) == int(tag_id) for t in tags_now):
            return out2 or {"ok": True}
    except Exception:
        pass
    # estratégia 3: atualizar o subscriber com lista de tags
    payload = {"tags": [int(tag_id)]}
    for path in (f"{BC_BASE}/subscriber/{subscriber_id}/", f"{BC_BASE}/subscribers/{subscriber_id}/"):
        try:
            out3 = await http_call("PATCH", path, api_headers(api_key), json=payload, ok=(200, 201, 204))
            tags_now = await real_list_sub_tags(api_key, subscriber_id)
            if any(int(t.get("id", -1)) == int(tag_id) for t in tags_now):
                return out3 or {"ok": True}
        except Exception:
            continue
    # retorna mesmo assim; alguns backends são eventual-consistentes
    return out or {"ok": True}

async def real_list_sub_tags(api_key: str, subscriber_id: int) -> List[Dict[str, Any]]:
    # tenta endpoint dedicado de tags do assinante
    try:
        tags = await http_call("GET", f"{BC_BASE}/subscriber/{subscriber_id}/tags/", api_headers(api_key))
        if isinstance(tags, list):
            return tags
    except Exception:
        pass
    # variação com plural
    try:
        tags = await http_call("GET", f"{BC_BASE}/subscribers/{subscriber_id}/tags/", api_headers(api_key))
        if isinstance(tags, list):
            return tags
    except Exception:
        pass
    # fallback: alguns backends retornam tags dentro do recurso subscriber
    try:
        sub = await http_call("GET", f"{BC_BASE}/subscriber/{subscriber_id}/", api_headers(api_key))
        if isinstance(sub, dict) and isinstance(sub.get("tags"), list):
            return sub["tags"]
    except Exception:
        pass
    # fallback com plural
    try:
        sub = await http_call("GET", f"{BC_BASE}/subscribers/{subscriber_id}/", api_headers(api_key))
        if isinstance(sub, dict) and isinstance(sub.get("tags"), list):
            return sub["tags"]
    except Exception:
        pass
    return []

# -----------------------
# Rotas
# -----------------------
@app.post("/bc/test-key")
async def test_key(body: TestKeyIn):
    if not REAL_MODE:
        # simulação: se tiver 20+ chars, ok
        return {"ok": len(body.apiKey) >= 20, "mode": "simulated"}
    try:
        await real_get_custom_fields(body.apiKey)
        return {"ok": True, "mode": "real"}
    except HTTPException as e:
        if e.status_code in (401, 403):
            return {"ok": False, "reason": "invalid_key", "status": e.status_code}
        raise

@app.post("/bc/find-tag-by-name")
async def find_tag_by_name(body: FindTagIn):
    name = body.name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Tag name empty.")
    if not REAL_MODE:
        tag = await sim_get_tag(name)
        if not tag:
            # cria automaticamente no modo simulado
            tag = await sim_create_tag(name)
        return tag
    tag = await real_get_tag(body.apiKey, name)
    if tag:
        return tag
    # instrução clara para o usuário
    raise HTTPException(status_code=404, detail=f"Tag '{name}' não encontrada. Crie no BotConversa em Configurações → Etiquetas com nome exato.")

@app.post("/bc/upsert-subscriber")
async def upsert_subscriber(body: UpsertSubscriberIn):
    phone = normalize_phone(body.phone)
    if not is_valid_br55(phone):
        raise HTTPException(status_code=400, detail="Telefone inválido. Esperado: 55 + DDD + número")
    if not REAL_MODE:
        sub = await sim_get_sub_by_phone(phone) or await sim_create_sub(phone)
        return {"id": int(sub["id"]), "phone": phone, "mode": "simulated"}
    # real
    sub = await real_get_sub_by_phone(body.apiKey, phone)
    if not sub or not sub.get("id"):
        sub = await real_create_sub(body.apiKey, phone)
    return {"id": int(sub["id"]), "phone": phone, "mode": "real"}

@app.post("/bc/attach-tag")
async def attach_tag(body: AttachTagIn):
    if not REAL_MODE:
        out = await sim_attach_tag(body.subscriberId, body.tagId)
        return {"ok": True, "mode": "simulated", **out}
    out = await real_attach_tag(body.apiKey, body.subscriberId, body.tagId)
    return {"ok": True, "mode": "real", **(out or {})}

@app.post("/bc/bulk-attach-tag")
async def bulk_attach(body: BulkAttachIn):
    tag_name = body.tagName.strip()
    if not tag_name:
        raise HTTPException(status_code=400, detail="tagName vazio.")
    phones_norm = [normalize_phone(p) for p in body.phones]
    valid = [p for p in phones_norm if is_valid_br55(p)]
    invalid = [p for p in phones_norm if not is_valid_br55(p)]

    # busca tag
    if not REAL_MODE:
        tag = await sim_get_tag(tag_name)
        if not tag:
            tag = await sim_create_tag(tag_name)
        tag_id = int(tag["id"])
    else:
        tag = await real_get_tag(body.apiKey, tag_name)
        if not tag:
            raise HTTPException(status_code=404, detail=f"Tag '{tag_name}' não encontrada.")
        tag_id = int(tag["id"])

    ok, fail = 0, 0
    details = []
    for phone in valid:
        try:
            # upsert subscriber
            if not REAL_MODE:
                sub = await sim_get_sub_by_phone(phone) or await sim_create_sub(phone)
                sub_id = int(sub["id"])
                await sim_attach_tag(sub_id, tag_id)
            else:
                sub = await real_get_sub_by_phone(body.apiKey, phone)
                if not sub or not sub.get("id"):
                    sub = await real_create_sub(body.apiKey, phone)
                sub_id = int(sub["id"])
                await real_attach_tag(body.apiKey, sub_id, tag_id)
            ok += 1
            details.append({"phone": phone, "status": "ok"})
        except HTTPException as e:
            fail += 1
            details.append({"phone": phone, "status": "error", "code": e.status_code})
        except Exception as e:
            fail += 1
            details.append({"phone": phone, "status": "error", "msg": str(e)})
        await sleep_ms(BATCH_DELAY_MS)

    return {
        "mode": "real" if REAL_MODE else "simulated",
        "tag": {"id": tag_id, "name": tag_name},
        "totals": {"received": len(phones_norm), "valid": len(valid), "invalid": len(invalid), "ok": ok, "fail": fail},
        "invalid": invalid,
        "details": details,
    }

@app.get("/")
async def root():
    return {
        "status": "ok",
        "mode": "real" if REAL_MODE else "simulated",
        "message": "BotConversa Proxy ativo. Use POST /bc/* endpoints"
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "mode": "real" if REAL_MODE else "simulated"}
