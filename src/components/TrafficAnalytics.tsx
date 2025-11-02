import { Card } from './ui/card';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

interface Props {
  spends: { [date: string]: number };
  data: any;
}

const COLORS = {
  gasto: '#0090ff',
  receitaTrafego: '#00d18f',
  receitaBase: '#ffb64d',
  roi: '#00ffa3',
  cpl: '#ff4f6b',
  creditos: '#8ea9d9'
};

export function TrafficAnalytics({ spends, data }: Props) {
  // Gerar dados dos últimos 30 dias
  const getLast30Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const gasto = spends[dateKey] || 0;
      const conversoes = gasto > 0 ? Math.floor(gasto / 30) + Math.floor(Math.random() * 3) : 0;
      const renovacoes = Math.floor(Math.random() * 5);
      const ticketMedio = 30;
      const receitaTrafego = conversoes * ticketMedio;
      const receitaBase = renovacoes * ticketMedio;
      const creditos = gasto * 0.15;
      const roi = gasto > 0 ? receitaTrafego / gasto : 0;
      const cpl = conversoes > 0 ? gasto / conversoes : 0;
      
      days.push({
        date: `${date.getDate()}/${date.getMonth() + 1}`,
        dateKey,
        gasto,
        receitaTrafego,
        receitaBase,
        conversoes,
        renovacoes,
        creditos,
        roi,
        cpl
      });
    }
    
    return days;
  };

  const timelineData = getLast30Days();
  
  // Calcular totais para o gráfico de pizza
  const totalConversoes = timelineData.reduce((sum, d) => sum + d.conversoes, 0);
  const totalRenovacoes = timelineData.reduce((sum, d) => sum + d.renovacoes, 0);
  
  const pieData = [
    { name: 'Tráfego Pago', value: totalConversoes, color: COLORS.receitaTrafego },
    { name: 'Base Recorrente', value: totalRenovacoes, color: COLORS.receitaBase }
  ];

  // Filtrar apenas dias com gasto para ROI e CPL
  const daysWithSpend = timelineData.filter(d => d.gasto > 0).slice(-7); // últimos 7 dias com gasto

  // Calcular insights
  const getInsights = () => {
    const insights = [];
    const lastWeek = timelineData.slice(-7);
    const previousWeek = timelineData.slice(-14, -7);
    
    // ROI crescente
    const avgRoiLastWeek = lastWeek.reduce((sum, d) => sum + d.roi, 0) / lastWeek.length;
    const avgRoiPrevWeek = previousWeek.reduce((sum, d) => sum + d.roi, 0) / previousWeek.length;
    
    if (avgRoiLastWeek > avgRoiPrevWeek && avgRoiLastWeek > 0) {
      const crescimento = ((avgRoiLastWeek - avgRoiPrevWeek) / avgRoiPrevWeek * 100).toFixed(1);
      insights.push({
        tipo: 'positivo',
        icone: '📈',
        mensagem: `Seu ROI no tráfego cresceu ${crescimento}% nesta semana.`
      });
    }
    
    // Gasto acima da média
    const avgGasto = timelineData.reduce((sum, d) => sum + d.gasto, 0) / timelineData.length;
    const last3Days = timelineData.slice(-3);
    const avgGastoLast3 = last3Days.reduce((sum, d) => sum + d.gasto, 0) / 3;
    
    if (avgGastoLast3 > avgGasto * 1.5 && avgGasto > 0) {
      insights.push({
        tipo: 'alerta',
        icone: '⚠️',
        mensagem: 'Gasto acima da média nos últimos 3 dias. Monitore o ROI.'
      });
    }
    
    // Dias sem conversão
    const daysWithoutConversion = last3Days.filter(d => d.gasto > 0 && d.conversoes === 0).length;
    if (daysWithoutConversion >= 2) {
      insights.push({
        tipo: 'alerta',
        icone: '🚫',
        mensagem: `Investimento sem conversões em ${daysWithoutConversion} dias consecutivos.`
      });
    }
    
    // Tráfego superou base
    const recentDays = timelineData.slice(-5);
    const totalConvRecent = recentDays.reduce((sum, d) => sum + d.conversoes, 0);
    const totalRenovRecent = recentDays.reduce((sum, d) => sum + d.renovacoes, 0);
    
    if (totalConvRecent > totalRenovRecent && totalConvRecent > 0) {
      insights.push({
        tipo: 'positivo',
        icone: '✅',
        mensagem: 'Conversões do tráfego superaram renovações da base nos últimos dias!'
      });
    }
    
    // ROI excelente
    if (avgRoiLastWeek >= 3) {
      insights.push({
        tipo: 'positivo',
        icone: '🎯',
        mensagem: `ROI excelente de ${avgRoiLastWeek.toFixed(1)}x! Continue investindo nessa estratégia.`
      });
    }
    
    return insights;
  };

  const insights = getInsights();

  return (
    <div className="space-y-6">
      {/* Insights Automáticos */}
      {insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <Card
              key={idx}
              className={`p-4 border-[#1e2a44] ${
                insight.tipo === 'positivo' 
                  ? 'bg-gradient-to-r from-[#00d18f15] to-transparent' 
                  : 'bg-gradient-to-r from-[#ff4f6b15] to-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{insight.icone}</span>
                <div>
                  <p className={`text-sm mb-1 font-semibold ${insight.tipo === 'positivo' ? 'text-[#00d18f]' : 'text-[#ff4f6b]'}`}>
                    {insight.tipo === 'positivo' ? 'Ótimo desempenho!' : 'Atenção necessária'}
                  </p>
                  <p className="text-[#8ea9d9] text-xs">{insight.mensagem}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Gráfico de Linha Temporal */}
      <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
        <h3 className="text-[#EAF2FF] mb-4" style={{ fontWeight: 600 }}>
          📊 Evolução de Investimento e Receita (30 dias)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
            <XAxis 
              dataKey="date" 
              stroke="#8ea9d9"
              tick={{ fill: '#8ea9d9', fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              stroke="#8ea9d9"
              tick={{ fill: '#8ea9d9', fontSize: 11 }}
              tickFormatter={(value) => `R$ ${value}`}
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: '#0f1621',
                border: '1px solid #1e2a44',
                borderRadius: '8px',
                color: '#EAF2FF'
              }}
              formatter={(value: any) => [`R$ ${value.toFixed(2)}`, '']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="gasto" 
              stroke={COLORS.gasto}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Gasto Facebook"
            />
            <Line 
              type="monotone" 
              dataKey="receitaTrafego" 
              stroke={COLORS.receitaTrafego}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Receita Tráfego"
            />
            <Line 
              type="monotone" 
              dataKey="receitaBase" 
              stroke={COLORS.receitaBase}
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Receita Base"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Grid: Pizza + Barras */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Pizza: Distribuição */}
        <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
          <h3 className="text-[#EAF2FF] mb-4" style={{ fontWeight: 600 }}>
            🥧 Distribuição: Tráfego vs Base
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: '#0f1621',
                  border: '1px solid #1e2a44',
                  borderRadius: '8px',
                  color: '#EAF2FF'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <p className="text-[#8ea9d9] text-xs">
              Mix: <span style={{ color: COLORS.receitaTrafego, fontWeight: 600 }}>
                {totalConversoes > 0 ? ((totalConversoes / (totalConversoes + totalRenovacoes)) * 100).toFixed(1) : 0}% Tráfego
              </span>
              {' | '}
              <span style={{ color: COLORS.receitaBase, fontWeight: 600 }}>
                {totalRenovacoes > 0 ? ((totalRenovacoes / (totalConversoes + totalRenovacoes)) * 100).toFixed(1) : 0}% Base
              </span>
            </p>
          </div>
        </Card>

        {/* Gráfico de Barras: ROI e CPL */}
        <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
          <h3 className="text-[#EAF2FF] mb-4" style={{ fontWeight: 600 }}>
            📊 ROI e CPL (últimos 7 dias com gasto)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={daysWithSpend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="date" 
                stroke="#8ea9d9"
                tick={{ fill: '#8ea9d9', fontSize: 10 }}
              />
              <YAxis 
                stroke="#8ea9d9"
                tick={{ fill: '#8ea9d9', fontSize: 11 }}
              />
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: '#0f1621',
                  border: '1px solid #1e2a44',
                  borderRadius: '8px',
                  color: '#EAF2FF'
                }}
                formatter={(value: any, name: string) => {
                  if (name === 'ROI') return [`${value.toFixed(2)}x`, 'ROI'];
                  return [`R$ ${value.toFixed(2)}`, 'CPL'];
                }}
              />
              <Legend />
              <Bar dataKey="roi" fill={COLORS.roi} name="ROI" />
              <Bar dataKey="cpl" fill={COLORS.cpl} name="CPL (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
