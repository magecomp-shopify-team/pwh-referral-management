import { Card, TextField, Button, BlockStack, InlineStack, Box, Grid, Text } from "@shopify/polaris";
import { useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

export default function ReferralForm() {
    const shopify = useAppBridge();
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        firstName: "",
        lastName: "",
        discount: "",
        timePeriod: "",
        referralCode: "",
        otherDetails: "",
        status: "",
    });

    const [errors, setErrors] = useState({});

    const getTone = (value) => {
        switch (value) {
            case "active":
                return "success";
            case "inactive":
                return "critical";
            case "pending":
                return "subdued";
            default:
                return "base";
        }
    };

    const handleChange = (field) => (value) => {
        const formattedValue = field === "referralCode" ? value.toUpperCase() : value
        setFormData((prev) => ({ ...prev, [field]: formattedValue }));
        setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const handleSubmit = async () => {

        const requiredFields = [
            "firstName",
            "email",
            "phone",
            "discount",
            "timePeriod",
            "referralCode",
        ];

        const newErrors = {};

        requiredFields.forEach((key) => {
            if (!formData[key]?.trim()) {
                newErrors[key] = "This field is required";
            }
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            const response = await fetch("/api/add-referral", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.status == 1) {
                shopify.toast.show("Referral submitted successfully!");
                handleCancel();
            } else {
                shopify.toast.show("Failled to save referaal details", { isError: true });
            }
        } catch (error) {
            console.error("Error submitting referral:", error);
        }
    };

    const handleCancel = () => {
        setFormData({
            email: "",
            phone: "",
            firstName: "",
            lastName: "",
            discount: "",
            timePeriod: "",
            referralCode: "",
            otherDetails: "",
        });
        setErrors({});
    };

    return (
        <Card>
            <BlockStack gap="500">

                <Grid columns={{ xs: 1, sm: 2, md: 2, lg: 2 }} gap={{ xs: "400", sm: "500" }}>
                    <Grid.Cell>
                        <TextField
                            label="First Name"
                            value={formData.firstName}
                            onChange={handleChange("firstName")}
                            placeholder="Enter first name"
                            error={errors.firstName}
                        />
                    </Grid.Cell>

                    <Grid.Cell>
                        <TextField
                            label="Last Name (Optional)"
                            value={formData.lastName}
                            onChange={handleChange("lastName")}
                            placeholder="Enter last name"
                        />
                    </Grid.Cell>

                    <Grid.Cell>
                        <TextField
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange("email")}
                            autoComplete="email"
                            placeholder="Enter customer's email"
                            error={errors.email}
                        />
                    </Grid.Cell>

                    <Grid.Cell>
                        <TextField
                            label="Phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(value) => {
                                if (/^\d{0,10}$/.test(value)) {
                                    handleChange("phone")(value);
                                }
                            }}
                            autoComplete="tel"
                            placeholder="Enter phone number"
                            error={errors.phone}
                        />
                    </Grid.Cell>

                    <Grid.Cell>
                        <TextField
                            label="Discount Percentage"
                            type="number"
                            value={formData.discount}
                            onChange={(v) => handleChange("discount")(v > 0 ? v : 1)}
                            suffix="%"
                            placeholder="e.g., 10"
                            error={errors.discount}
                        />
                    </Grid.Cell>

                    <Grid.Cell>
                        <TextField
                            label="Time Period (Days)"
                            type="number"
                            value={formData.timePeriod}
                            onChange={(v) => handleChange("timePeriod")(v > 0 ? v : 1)}
                            placeholder="e.g., 30"
                            error={errors.timeValue}
                        />
                    </Grid.Cell>

                    <Grid.Cell columnSpan={{ xs: 1, sm: 2 }}>
                        <TextField
                            label="Referral Code"
                            helpText={"Referral code must be unique"}
                            value={formData.referralCode}
                            onChange={handleChange("referralCode")}
                            placeholder="e.g., PWH1234"
                            error={errors.referralCode}
                        />
                    </Grid.Cell>
                    <InlineStack align="left" gap="400">
                        <Text variant="bodyMd" fontWeight="medium">
                            Status
                        </Text>
                        <InlineStack gap="200" align="start" blockAlign="center" wrap={false}>
                            {["active", "inactive", "pending"].map((value) => (
                                <Button
                                    key={value}
                                    pressed={formData.status === value}
                                    tone={getTone(value)}
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            status: value,
                                        }))
                                    }
                                >
                                    {value.charAt(0).toUpperCase() + value.slice(1)}
                                </Button>
                            ))}
                        </InlineStack>
                    </InlineStack>

                    <Grid.Cell columnSpan={{ xs: 1, sm: 2 }}>
                        <TextField
                            label="Other details (Optional)"
                            placeholder={`Instagram ID: pwh_official\nTwitter ID: pwh_tweets`}
                            multiline={5}
                            autoComplete="off"
                            value={formData.otherDetails}
                            onChange={handleChange("otherDetails")}
                        />
                    </Grid.Cell>
                </Grid>

                <InlineStack align="center">
                    <Button variant="primary" onClick={handleSubmit}>
                        Submit Referral
                    </Button>
                    <Box paddingInlineStart={200}>
                        <Button variant="secondary" tone="critical" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Box>
                </InlineStack>
            </BlockStack>
        </Card>
    );
}
