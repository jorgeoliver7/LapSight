import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from 'recharts';
import { SessionAnalytics } from '../../types';
import { formatLapTime, formatGap } from '../../api/sessions';

interface Props {
  a: SessionAnalytics;
  b: SessionAnalytics;
}

const COLOR_A = '#d32f2f';
const COLOR_B = '#1976d2';

interface RowProps {
  label: string;
  va?: number | null;
  vb?: number | null;
  format?: (n?: number | null) => string;
  invert?: boolean; // si true, menor es mejor (default true)
}

const StatRow: React.FC<RowProps> = ({ label, va, vb, format = formatLapTime, invert = true }) => {
  let winner: 'a' | 'b' | null = null;
  if (va != null && vb != null) {
    if (va === vb) winner = null;
    else if (invert) winner = va < vb ? 'a' : 'b';
    else winner = va > vb ? 'a' : 'b';
  }
  const delta = va != null && vb != null ? va - vb : null;

  return (
    <TableRow>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {label}
        </Typography>
      </TableCell>
      <TableCell
        align="right"
        sx={{
          fontFamily: 'monospace',
          fontWeight: winner === 'a' ? 700 : 400,
          color: winner === 'a' ? 'success.main' : undefined,
        }}
      >
        {format(va)}
      </TableCell>
      <TableCell
        align="right"
        sx={{
          fontFamily: 'monospace',
          fontWeight: winner === 'b' ? 700 : 400,
          color: winner === 'b' ? 'success.main' : undefined,
        }}
      >
        {format(vb)}
      </TableCell>
      <TableCell align="right" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
        {delta != null ? formatGap(delta) : '—'}
      </TableCell>
    </TableRow>
  );
};

const ComparisonView: React.FC<Props> = ({ a, b }) => {
  // Datos del gráfico: vueltas indexadas por lapNumber, con valor de A y B
  const allLapNumbers = Array.from(
    new Set([...a.perLap.map((l) => l.lapNumber), ...b.perLap.map((l) => l.lapNumber)])
  ).sort((x, y) => x - y);

  const lapsA = new Map(a.perLap.map((l) => [l.lapNumber, l]));
  const lapsB = new Map(b.perLap.map((l) => [l.lapNumber, l]));

  const chartData = allLapNumbers.map((n) => ({
    lapNumber: n,
    a: lapsA.get(n)?.valid ? (lapsA.get(n)!.lapTimeMs / 1000) : null,
    b: lapsB.get(n)?.valid ? (lapsB.get(n)!.lapTimeMs / 1000) : null,
  }));

  // Tabla de gap por vuelta común (vueltas válidas en ambas)
  const commonRows = allLapNumbers
    .map((n) => ({
      lapNumber: n,
      timeA: lapsA.get(n)?.lapTimeMs ?? null,
      timeB: lapsB.get(n)?.lapTimeMs ?? null,
      validA: lapsA.get(n)?.valid ?? false,
      validB: lapsB.get(n)?.valid ?? false,
    }))
    .filter((r) => r.timeA != null || r.timeB != null);

  const bestGap = a.bestLapMs != null && b.bestLapMs != null ? a.bestLapMs - b.bestLapMs : null;
  const theoreticalGap =
    a.theoreticalBestLapMs != null && b.theoreticalBestLapMs != null
      ? a.theoreticalBestLapMs - b.theoreticalBestLapMs
      : null;

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 12, height: 12, bgcolor: COLOR_A, borderRadius: 0 }} />
          <Typography variant="h6" fontWeight={600}>
            {a.sessionName}
          </Typography>
        </Box>
        <Typography variant="h6" color="textSecondary">
          vs
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Box sx={{ width: 12, height: 12, bgcolor: COLOR_B, borderRadius: 0 }} />
          <Typography variant="h6" fontWeight={600}>
            {b.sessionName}
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                KPIs side by side
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell align="right" sx={{ color: COLOR_A, fontWeight: 700 }}>
                        A
                      </TableCell>
                      <TableCell align="right" sx={{ color: COLOR_B, fontWeight: 700 }}>
                        B
                      </TableCell>
                      <TableCell align="right">A − B</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <StatRow label="Best lap" va={a.bestLapMs} vb={b.bestLapMs} />
                    <StatRow label="Average" va={a.averageMs} vb={b.averageMs} />
                    <StatRow label="Median" va={a.medianMs} vb={b.medianMs} />
                    <StatRow
                      label="Consistency (σ)"
                      va={a.stdDevMs}
                      vb={b.stdDevMs}
                      format={(n) => (n != null ? `±${(n / 1000).toFixed(3)}s` : '—')}
                    />
                    <StatRow
                      label="Theoretical best"
                      va={a.theoreticalBestLapMs}
                      vb={b.theoreticalBestLapMs}
                    />
                    <StatRow label="Best S1" va={a.bestSector1Ms} vb={b.bestSector1Ms} />
                    <StatRow label="Best S2" va={a.bestSector2Ms} vb={b.bestSector2Ms} />
                    <StatRow label="Best S3" va={a.bestSector3Ms} vb={b.bestSector3Ms} />
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                Summary
              </Typography>
              <Box display="flex" flexDirection="column" gap={1.5}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Best lap delta
                  </Typography>
                  <Typography variant="h5" fontWeight={700} fontFamily="monospace">
                    {bestGap != null ? formatGap(bestGap) : '—'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {bestGap != null && bestGap < 0 ? `${a.sessionName} is faster` : bestGap != null && bestGap > 0 ? `${b.sessionName} is faster` : 'Tie'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Theoretical best delta
                  </Typography>
                  <Typography variant="h5" fontWeight={700} fontFamily="monospace">
                    {theoreticalGap != null ? formatGap(theoreticalGap) : '—'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Raw potential summing best sectors
                  </Typography>
                </Box>
                <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
                  <Chip
                    label={`A: ${a.validLaps}/${a.totalLaps} valid`}
                    size="small"
                    sx={{ bgcolor: COLOR_A, color: 'white' }}
                  />
                  <Chip
                    label={`B: ${b.validLaps}/${b.totalLaps} valid`}
                    size="small"
                    sx={{ bgcolor: COLOR_B, color: 'white' }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Lap times (overlay)
          </Typography>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lapNumber" label={{ value: 'Lap', position: 'insideBottom', offset: -5 }} />
              <YAxis
                tickFormatter={(v) => v.toFixed(2)}
                label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }}
                domain={['auto', 'auto']}
              />
              <RTooltip
                formatter={(v: any) => (typeof v === 'number' ? `${v.toFixed(3)} s` : '—')}
                labelFormatter={(l) => `Lap ${l}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="a"
                stroke={COLOR_A}
                strokeWidth={2}
                dot={{ r: 4 }}
                name={a.sessionName}
                connectNulls
              />
              <Line
                type="monotone"
                dataKey="b"
                stroke={COLOR_B}
                strokeWidth={2}
                dot={{ r: 4 }}
                name={b.sessionName}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" mb={1}>
            Gap per lap
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell align="right" sx={{ color: COLOR_A }}>
                    Time A
                  </TableCell>
                  <TableCell align="right" sx={{ color: COLOR_B }}>
                    Time B
                  </TableCell>
                  <TableCell align="right">Gap (A − B)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {commonRows.map((row) => {
                  const gap =
                    row.timeA != null && row.timeB != null && row.validA && row.validB
                      ? row.timeA - row.timeB
                      : null;
                  return (
                    <TableRow key={row.lapNumber}>
                      <TableCell>{row.lapNumber}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: 'monospace',
                          opacity: row.validA ? 1 : 0.5,
                          color: !row.validA ? 'error.main' : undefined,
                        }}
                      >
                        {formatLapTime(row.timeA)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: 'monospace',
                          opacity: row.validB ? 1 : 0.5,
                          color: !row.validB ? 'error.main' : undefined,
                        }}
                      >
                        {formatLapTime(row.timeB)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          color: gap == null ? 'text.secondary' : gap < 0 ? 'success.main' : gap > 0 ? 'error.main' : undefined,
                        }}
                      >
                        {gap != null ? formatGap(gap) : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ComparisonView;
