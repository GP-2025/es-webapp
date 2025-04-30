import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import SupportIcon from "@mui/icons-material/Support";
import { supportService } from "../../services/supportService";
import { useTranslation } from "react-i18next";

const SupportPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === "rtl";

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      nationalId: "",
      problem: "",
      description: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setSubmitError(null);
      await supportService.sendSupportRequest(data);
      navigate("/login");
    } catch (err) {
      setSubmitError(err?.response?.data?.message || t("support.submitError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "grey.50",
        py: { xs: 4, sm: 6, md: 8 },
        overflow: "auto",
      }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "primary.main",
              boxShadow: 2,
            }}
          >
            <SupportIcon fontSize="large" />
          </Avatar>

          <Typography
            component="h1"
            variant="h4"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              color: "text.primary",
            }}
          >
            {t("support.title")}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: "center",
              color: "text.secondary",
              maxWidth: "600px",
              mb: 2,
            }}
          >
            {t("support.description")}
          </Typography>

          <Paper
            elevation={isMobile ? 0 : 3}
            sx={{
              p: { xs: 2, sm: 4 },
              width: "100%",
              borderRadius: 2,
              backgroundColor: "background.paper",
            }}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: t("support.nameRequired") }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t("support.fullName")}
                        variant="outlined"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="nationalId"
                    control={control}
                    rules={{ required: t("support.nationalIdRequired") }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t("support.nationalId")}
                        variant="outlined"
                        error={!!errors.nationalId}
                        helperText={errors.nationalId?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: t("support.emailRequired"),
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: t("support.invalidEmail"),
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t("support.emailAddress")}
                        variant="outlined"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    rules={{
                      required: t("support.descriptionRequired"),
                      minLength: {
                        value: 20,
                        message: t("support.descriptionMinLength"),
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        multiline
                        rows={4}
                        label={t("support.problemDescription")}
                        variant="outlined"
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {submitError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {submitError}
                </Alert>
              )}

              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  justifyContent: "space-between",
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate("/login")}
                  fullWidth={isMobile}
                >
                  {t("support.backToLogin")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  fullWidth={isMobile}
                  sx={{
                    height: 48,
                    px: 4,
                  }}
                >
                  {isLoading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    t("support.submitRequest")
                  )}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default SupportPage;
