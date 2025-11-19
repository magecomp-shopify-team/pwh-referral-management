import { useEffect, useState, useCallback } from "react";
import {
    BlockStack,
    FormLayout,
    TextField,
    Box,
    Text,
    InlineStack,
    Button,
} from "@shopify/polaris";

export default function ReferralEditForm({ referralId, onFormChange }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        discount: "",
        timePeriod: "",
        otherDetails: "",
        status: "",
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (referralId) {
            setErrors({});
            fetchReferralData();
        }
    }, [referralId]);

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/get-referral/${referralId}`);
            const data = await response.json();
            console.log(data.data.status);
            if (data?.data) {
                const formData = {
                    firstName: data.data.first_name || "",
                    lastName: data.data.last_name || "",
                    email: data.data.email || "",
                    phone: data.data.phone || "",
                    discount: data.data.discount_percentage || "",
                    timePeriod: data.data.time_period || "",
                    otherDetails: data.data.other_details || "",
                    status: data.data.status || "inactive",
                };
                setFormData(formData);
                onFormChange(formData, validateForm(formData));
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching referral:", error);
            setLoading(false);
        }
    };

    const validateForm = (data) => {
        const requiredFields = [
            "firstName",
            "email",
            "phone",
            "discount",
            "timePeriod",
        ];

        const newErrors = {};

        requiredFields.forEach((key) => {
            const value = data[key];
            if (value === undefined || value === null || String(value).trim() === "") {
                newErrors[key] = "This field is required";
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = useCallback(
        (field) => (value) => {
            const updatedForm = { ...formData, [field]: value };
            setFormData(updatedForm);
            validateForm(updatedForm);
            onFormChange(updatedForm, validateForm(updatedForm));
        },
        [formData, onFormChange]
    );

    const handleStatusChange = (value) => {
        const updatedForm = { ...formData, status: value };
        setFormData(updatedForm);
        onFormChange(updatedForm, validateForm(updatedForm));
    };

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

    if (loading) {
        return (
            <Box
                position="fixed"
                inset={0}
                display="flex"
                align="center"
                justify="center"
            >
                <Text variant="bodyLg" as="p">
                    Loading...
                </Text>
            </Box>
        );
    }

    return (
        <Box
            width="100%"
            display="flex"
            align="center"
            justify="center"
            paddingBlock="600"
        >
            <Box maxWidth="600px" width="100%">
                <BlockStack gap="400">
                    <FormLayout>
                        <FormLayout.Group>
                            <TextField
                                label="First Name"
                                value={formData.firstName}
                                onChange={handleChange("firstName")}
                                placeholder="Enter first name"
                                error={errors.firstName}
                            />
                            <TextField
                                label="Last Name"
                                value={formData.lastName}
                                onChange={handleChange("lastName")}
                                placeholder="Enter last name"
                            />
                        </FormLayout.Group>

                        <FormLayout.Group>
                            <TextField
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange("email")}
                                autoComplete="email"
                                placeholder="Enter customer's email"
                                error={errors.email}
                            />
                            <TextField
                                label="Phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(value) => {
                                    if (/^\d{0,10}$/.test(value))
                                        handleChange("phone")(value);
                                }}
                                autoComplete="tel"
                                placeholder="Enter phone number"
                                error={errors.phone}
                            />
                        </FormLayout.Group>

                        <FormLayout.Group>
                            <TextField
                                label="Discount Percentage"
                                type="number"
                                value={formData.discount}
                                onChange={(v) =>
                                    handleChange("discount")(v > 0 ? v : 1)
                                }
                                suffix="%"
                                placeholder="e.g., 10"
                                error={errors.discount}
                            />
                            <TextField
                                label="Time Period (Days)"
                                type="number"
                                value={formData.timePeriod}
                                onChange={(v) =>
                                    handleChange("timePeriod")(v > 0 ? v : 1)
                                }
                                placeholder="e.g., 30"
                                error={errors.timePeriod}
                            />
                        </FormLayout.Group>

                        <InlineStack align="left" gap="400">
                            <Text variant="bodyMd" as="p" fontWeight="medium">
                                Status
                            </Text>
                            <InlineStack gap="200" align="start" blockAlign="center">
                                {["active", "inactive", "pending"].map((value) => (
                                    <Button
                                        key={value}
                                        pressed={formData.status === value}
                                        tone={getTone(value)}
                                        onClick={() => handleStatusChange(value)}
                                    >
                                        {value.charAt(0).toUpperCase() + value.slice(1)}
                                    </Button>
                                ))}
                            </InlineStack>
                        </InlineStack>

                        <TextField
                            label="Other details"
                            placeholder={`Instagram ID: pwh_official\nTwitter ID: pwh_tweets`}
                            multiline={5}
                            autoComplete="off"
                            value={formData.otherDetails}
                            onChange={handleChange("otherDetails")}
                        />
                    </FormLayout>
                </BlockStack>
            </Box>
        </Box>
    );
}
