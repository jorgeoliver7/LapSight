import React from 'react';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Paper,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TireCompound } from '../../types';
import { ManualLap } from '../../api/sessions';
import { Mono, Label } from '../../components/apex';
import { colors } from '../../theme/tokens';

interface Props {
  laps: ManualLap[];
  onChange: (laps: ManualLap[]) => void;
}

const ManualLapsEditor: React.FC<Props> = ({ laps, onChange }) => {
  const updateLap = (index: number, patch: Partial<ManualLap>) => {
    const next = laps.map((lap, i) => (i === index ? { ...lap, ...patch } : lap));
    onChange(next);
  };

  const addLap = () => {
    const nextNumber = laps.length === 0 ? 1 : Math.max(...laps.map((l) => l.lapNumber)) + 1;
    onChange([
      ...laps,
      {
        lapNumber: nextNumber,
        lapTime: '',
        sector1: '',
        sector2: '',
        sector3: '',
        valid: true,
        compound: undefined,
        notes: '',
      },
    ]);
  };

  const removeLap = (index: number) => {
    onChange(laps.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Mono
        style={{
          fontSize: 11,
          color: colors.textMute,
          letterSpacing: '0.3px',
          marginBottom: 8,
          display: 'block',
          lineHeight: 1.5,
        }}
      >
        Times in <code style={{ color: colors.accent }}>1:23.456</code> or{' '}
        <code style={{ color: colors.accent }}>83.456</code> format. Sectors optional.
      </Mono>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 50 }}>#</TableCell>
              <TableCell sx={{ minWidth: 110 }}>Time *</TableCell>
              <TableCell sx={{ minWidth: 90 }}>S1</TableCell>
              <TableCell sx={{ minWidth: 90 }}>S2</TableCell>
              <TableCell sx={{ minWidth: 90 }}>S3</TableCell>
              <TableCell sx={{ width: 70 }}>Valid</TableCell>
              <TableCell sx={{ minWidth: 100 }}>Tire</TableCell>
              <TableCell sx={{ width: 50 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {laps.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Mono style={{ color: colors.textMute, fontSize: 11, letterSpacing: '0.4px' }}>
                    Click "Add lap" to start
                  </Mono>
                </TableCell>
              </TableRow>
            ) : (
              laps.map((lap, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={lap.lapNumber}
                      onChange={(e) =>
                        updateLap(idx, { lapNumber: Math.max(1, Number(e.target.value) || 1) })
                      }
                      inputProps={{ min: 1, style: { width: 40 } }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="1:23.456"
                      value={lap.lapTime}
                      onChange={(e) => updateLap(idx, { lapTime: e.target.value })}
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="25.872"
                      value={lap.sector1 || ''}
                      onChange={(e) => updateLap(idx, { sector1: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="29.103"
                      value={lap.sector2 || ''}
                      onChange={(e) => updateLap(idx, { sector2: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      placeholder="23.481"
                      value={lap.sector3 || ''}
                      onChange={(e) => updateLap(idx, { sector3: e.target.value })}
                    />
                  </TableCell>
                  <TableCell>
                    <Checkbox
                      checked={lap.valid !== false}
                      onChange={(e) => updateLap(idx, { valid: e.target.checked })}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      select
                      value={lap.compound || ''}
                      onChange={(e) =>
                        updateLap(idx, {
                          compound: (e.target.value as TireCompound) || undefined,
                        })
                      }
                      sx={{ minWidth: 90 }}
                    >
                      <MenuItem value="">—</MenuItem>
                      {Object.values(TireCompound).map((c) => (
                        <MenuItem key={c} value={c}>
                          {c}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => removeLap(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={1} display="flex" justifyContent="space-between" alignItems="center">
        <Label>{laps.length} {laps.length === 1 ? 'lap' : 'laps'}</Label>
        <Button startIcon={<AddIcon />} onClick={addLap} size="small">
          Add lap
        </Button>
      </Box>
    </Box>
  );
};

export default ManualLapsEditor;
