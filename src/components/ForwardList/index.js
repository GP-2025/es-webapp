import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    TextField,
    Radio,
    Checkbox,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Button,
    Box,
    Typography,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useTranslation } from "react-i18next"; // Import the hook

import getContacts from "../../services/getContactsService"; // Import the getContacts service

const CategorizedForwardList = ({ open, onClose, onSend }) => {
    const { t, i18n } = useTranslation(); // Access translation function and i18n object

    const [recipients, setRecipients] = useState([]);
    const [contacts, setContacts] = useState([]);
    const [categorizedContacts, setCategorizedContacts] = useState({});

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const data = await getContacts();
                setContacts(data);
                categorizeContacts(data);
            } catch (error) {
                console.error("Error fetching contacts:", error);
            }
        };

        fetchContacts();
    }, []);

    const categorizeContacts = (contacts) => {
        const categorized = contacts.reduce((acc, contact) => {
            const category = contact.departmentName || "Head";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(contact);
            return acc;
        }, {});
        setCategorizedContacts(categorized);
    };

    const handleToggleRecipient = (recipient) => {
        setRecipients((prevRecipients) => {
            const isCurrentlySelected = prevRecipients.some(
                (r) => r.id === recipient.id
            );
            return isCurrentlySelected
                ? prevRecipients.filter((r) => r.id !== recipient.id)
                : [...prevRecipients, recipient];
        });
    };

    const handleSend = () => {
        if (onSend) {
            onSend(recipients);
        }
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                },
            }}
            dir={i18n.dir}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: "1px solid rgba(0,0,0,0.12)",
                    py: 2,
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <PersonAddIcon color="black" />
                    <Typography variant="h6" color="black">
                        {t("forward.ForwardList")}
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                        "&:hover": {
                            backgroundColor: (theme) => theme.palette.grey[100],
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* <Box sx={{ px: 3, pt: 2 }}>
        <TextField
          label={t("forward.SelectedRecipients")}
          value={recipients.map((r) => r.name).join(", ")}
          fullWidth
          variant="outlined"
          margin="dense"
          InputProps={{
            readOnly: true,
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
          dir={i18n.dir}
        />
      </Box> */}

            <DialogContent sx={{ p: 0, m: 0 }}>
                {Object.keys(categorizedContacts).map((category) => (
                    <Accordion key={category} defaultExpanded
                        sx={{
                            m: 0,
                            p: 0,
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                                m: 0,
                                p: 0,
                                px: 2,
                                backgroundColor: "rgba(0, 0, 0, 0.09)",
                                border: "none"
                            }}
                        >
                            <Typography variant="subtitle1" color="black">
                                {category}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{
                                m: 0,
                                p: 0,
                                px: 2,
                            }}
                        >
                            <List>
                                {categorizedContacts[category].map((recipient) => (
                                    <ListItem
                                        key={recipient.id}
                                        onClick={() => {
                                            // Clear any existing selections first
                                            if (recipients.length > 0) {
                                                recipients.forEach((r) => handleToggleRecipient(r));
                                            }
                                            handleToggleRecipient(recipient);
                                        }}
                                        sx={{
                                            m: 0,
                                            p: 0,
                                            px: 2,
                                            borderRadius: 2,
                                            "&:hover": {
                                                backgroundColor: "rgba(0,0,0,0.15)",
                                                cursor: "pointer",
                                            },
                                            transition: "background-color 0.1s",
                                        }}
                                    >
                                        <ListItemIcon>
                                            <Radio
                                                edge="start"
                                                checked={recipients.some((r) => r.id === recipient.id)}
                                                tabIndex={-1}
                                                disableRipple
                                                color="black"
                                            />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={recipient.email}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </DialogContent>

            <Box
                sx={{
                    p: 2,
                    display: "flex",
                }}
            >
                <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={handleSend}
                    disabled={recipients.length === 0}
                    sx={{
                        borderRadius: 2,
                        py: 1.5,
                        mx: "auto",
                        width: "120px",
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        "&:hover": {
                            boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                        },
                        "&.Mui-disabled": {
                            backgroundColor: "rgba(0,0,0,0.12)",
                            color: "rgba(0,0,0,0.26)",
                        },
                    }}
                >
                    {t("Compose.send")}
                </Button>
            </Box>
        </Dialog>
    );
};

export default CategorizedForwardList;
