import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Alert, Skeleton, Chip } from '@mui/material';
import { sessionsApi } from '../../api/sessions';
import { Insight } from '../../types';

interface Props {
  sessionId: number;
}

const SEVERITY_COLOR: Record<Insight['severity'], 'info' | 'success' | 'warning' | 'error'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

const InsightsPanel: React.FC<Props> = ({ sessionId }) => {
  const [insights, setInsights] = useState<Insight[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    sessionsApi
      .insights(sessionId)
      .then((r) => setInsights(r.insights))
      .catch((e: any) => setError(e?.response?.data?.message || 'No se pudieron generar insights'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={2}>
            Hallazgos automáticos
          </Typography>
          <Skeleton height={40} sx={{ mb: 1 }} />
          <Skeleton height={40} sx={{ mb: 1 }} />
          <Skeleton height={40} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="warning">{error}</Alert>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="subtitle1" fontWeight="bold">
            Hallazgos automáticos
          </Typography>
          <Chip
            size="small"
            label={`${insights.length} insight${insights.length !== 1 ? 's' : ''}`}
            variant="outlined"
          />
        </Box>
        <Typography variant="caption" color="textSecondary" display="block" mb={2}>
          Generados por análisis estadístico de los datos de la sesión: theoretical best, degradación,
          consistencia, outliers, comparativa entre stints y sectores débiles.
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          {insights.map((ins, idx) => (
            <Alert
              key={idx}
              severity={SEVERITY_COLOR[ins.severity]}
              icon={<span style={{ fontSize: '1.3rem' }}>{ins.icon}</span>}
              sx={{ '& .MuiAlert-message': { width: '100%' } }}
            >
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {ins.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ins.detail}
                </Typography>
              </Box>
            </Alert>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
