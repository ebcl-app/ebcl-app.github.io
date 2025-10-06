import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface BaseCardProps {
  avatar?: React.ReactNode;
  title: string;
  subtitle?: string;
  chips?: React.ReactNode[];
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  actions?: React.ReactNode;
  expandable?: boolean;
  expandedContent?: React.ReactNode;
  onClick?: () => void;
  sx?: any;
}

export const StandardizedCard: React.FC<BaseCardProps> = ({
  avatar,
  title,
  subtitle,
  chips = [],
  stats = [],
  actions,
  expandable = false,
  expandedContent,
  onClick,
  sx = {},
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <Card
      sx={{
        boxShadow: 2,
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-2px)',
          transition: 'all .2s'
        },
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
      onClick={handleCardClick}
    >
      <CardContent>
        {/* Header Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: chips.length > 0 || stats.length > 0 ? 2 : 0 }}>
          {avatar && (
            <Box sx={{ flexShrink: 0 }}>
              {avatar}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: subtitle ? 0.5 : 0 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {expandable && (
            <IconButton size="small" onClick={handleExpandClick}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>

        {/* Chips Section */}
        {chips.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: stats.length > 0 ? 2 : 0, flexWrap: 'wrap' }}>
            {chips.map((chip, index) => (
              <React.Fragment key={index}>
                {chip}
              </React.Fragment>
            ))}
          </Box>
        )}

        {/* Stats Section */}
        {stats.length > 0 && (
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(stats.length, 2)}, 1fr)`,
            gap: 1,
            mb: actions ? 2 : 0
          }}>
            {stats.map((stat, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: 'center',
                  p: 1,
                  bgcolor: '#F9FAFB',
                  borderRadius: 1
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1F2937' }}>
                  {stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Expanded Content */}
        {expanded && expandedContent && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E7EB' }}>
            {expandedContent}
          </Box>
        )}

        {/* Actions Section */}
        {actions && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {actions}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StandardizedCard;