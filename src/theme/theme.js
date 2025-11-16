import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
    palette: {
        background: {
            default: '#012D5A',
            paper: '#0A3D72'
        },
        primary: {
            main: '#FFD000',
            contrastText: '#012D5A'
        },
        secondary: {
            main: '#FFB300',
            contrastText: '#012D5A'
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#B0BEC5'
        },
        divider: '#B0BEC5'
    },
    typography: {
        fontFamily: '"Inter", "Poppins", system-ui, sans-serif',
        h1: {
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#FFFFFF'
        },
        h2: {
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#FFFFFF'
        },

        h3: {
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#000000'
        },
        body1: {
            fontSize: '0.8rem',
            fontWeight: 400,
            color: '#B0BEC5'
        },
        button: {
            fontWeight: 600,
            textTransform: 'none'
        }
    },
    shape: {
        borderRadius: 8
    },
    components: {
        MuiButton: {
            styleOverrides: {
                contained: {
                    background: 'linear-gradient(90deg, #FFD000 0%, #FFB300 100%)',
                    color: '#012D5A',
                    borderRadius: 8,
                    '&:hover': {
                        background: 'linear-gradient(90deg, #FFB300 0%, #FFD000 100%)'
                    }
                }
            }
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundColor: '#0A3D72',
                    border: '1px solid #B0BEC5',
                    borderRadius: 5
                }
            }
        },
        // Updated overrides for outlined TextField / OutlinedInput:
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 6,
                    // do NOT change the input background here — we only want to style the border
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#B0BEC5'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        // focused border color (use primary or another color)
                        borderColor: '#FFD000'
                    }
                },
                notchedOutline: {
                    // default (inactive) border color -> use divider
                    borderColor: '#B0BEC5'
                },
                input: {
                    // ensure text is readable on your dark background
                    color: '#FFFFFF'
                }
            }
        }
    },
    spacing: 8
});
