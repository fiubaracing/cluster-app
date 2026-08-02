import MuiButton from "@mui/material/Button";
import { ButtonProps } from "./types";
import { styled } from "@mui/material/styles";

const StyledButton = styled(MuiButton)<ButtonProps>(() => ({
  height: '56px',
  textTransform: 'none',
  fontSize: '1.25rem',
  lineHeight: '1.25rem',
  borderRadius: '12px',
  fontFamily: 'var(--font-sans)',
  color: 'var(--foreground)',
  borderColor: 'var(--border)',
  backgroundColor: 'var(--surface)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--primary)', // Blue pop on hover
  },
  textAlign: 'center',
  verticalAlign: 'middle',
}));

export default function Button({ children, onClick, disabled, ...props }: ButtonProps) {
    return (
        <StyledButton 
            {...props}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </StyledButton>
    )
}