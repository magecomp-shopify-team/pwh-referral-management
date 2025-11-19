import React, { useState, useEffect } from "react";
import {
    Card,
    Text,
    BlockStack,
    InlineGrid,
    Badge,
    Box,
    Divider,
    Icon,
    useBreakpoints,
    InlineStack,
} from "@shopify/polaris";
import { PersonIcon, EmailIcon, HashtagIcon, MobileIcon, ReferralCodeIcon, DiscountCodeIcon, DiscountIcon, CalendarCheckIcon, CalendarIcon, ContractFilledIcon, ContractIcon } from "@shopify/polaris-icons";

export default function UserReferralInfo({ referralId }) {
    const [viewData, setViewData] = useState();
    const { smUp } = useBreakpoints();

    const [loading, setLoading] = useState(false);

    const InfoItem = ({ icon, label, value, tone = "success", isBadge = false }) => (
        <Box minWidth={smUp ? "120px" : "100%"}>
            <InlineGrid columns="auto 1fr" gap="200" alignItems="center">
                <Icon source={icon} tone="subdued" />
                <Text tone="subdued" variant="bodyMd">{label}</Text>
            </InlineGrid>
            <Box paddingInlineStart="500">
                {isBadge ? (
                    <Box paddingInlineStart={200}>
                        <Badge tone={tone} size="large">
                            {value}
                        </Badge>
                    </Box>
                ) : (
                    <Box paddingInlineStart={200}>
                        <Text fontWeight="medium" variant="bodyMd">
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: value ? value.replace(/\n/g, "<br/>") : "",
                                }}
                            />
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    );

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/get-referral-details/${referralId}`);
            const data = await response.json();
            if (data.status === 1) {
                const referral = data.data?.referral || {};

                const pdata = {
                    name: `${referral.first_name || ""} ${referral.last_name || ""}`.trim(),
                    email: referral.email || "",
                    phone: referral.phone || "",
                    referralCode: data.data?.referral_code || "",
                    discount: data.data?.discount_percentage || "",
                    time_period: data.data?.time_period || "",
                    other_details: referral.other_details || "",
                    status: referral.status || "",
                };

                setViewData(pdata);
            }

            setLoading(false);

        } catch (error) {
            console.error("Error fetching referral:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (referralId) {
            fetchReferralData();
        }
    }, [referralId]);

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
        <Card padding="400">

            <InlineStack gap="200" align="left">
                <Box>
                    <Icon source={PersonIcon} tone="subdued" />
                </Box>
                <Box>
                    <Text variant="headingLg" as="h2" fontWeight="bold">
                        {viewData?.name}
                    </Text>
                </Box>
            </InlineStack>
            <Box paddingBlockStart={300} paddingBlockEnd={500}>
                <Divider borderColor="border" />
            </Box>
            <BlockStack gap="500">
                <BlockStack gap="400">
                    <InlineGrid
                        columns={smUp ? 3 : 1}
                        gap="400"
                        alignItems="start"
                    >
                        <InfoItem
                            icon={EmailIcon}
                            label="Email Address"
                            value={viewData?.email}
                        />
                        <InfoItem
                            icon={MobileIcon}
                            label="Phone"
                            value={viewData?.phone}
                        />
                        <InfoItem
                            icon={HashtagIcon}
                            label="Referral Code"
                            value={viewData?.referralCode}
                            isBadge={true}
                        />
                        <InfoItem
                            icon={DiscountIcon}
                            label="Discount Percentage"
                            value={viewData?.discount}
                        />
                        <InfoItem
                            icon={CalendarIcon}
                            label="Discount Duration"
                            value={viewData?.time_period}
                        />
                        <InfoItem
                            icon={CalendarIcon}
                            label="Status"
                            value={viewData?.status}
                            tone={
                                viewData?.status === "active"
                                    ? "success"
                                    : viewData?.status === "inactive"
                                        ? "critical"
                                        : "warning"
                            }

                            isBadge={true}
                        />
                    </InlineGrid>
                </BlockStack>
                <Box paddingBlockStart={100}>
                    <Divider />
                </Box>
                <BlockStack>
                    <InfoItem
                        icon={ContractIcon}
                        label="Other details"
                        value={viewData?.other_details}
                    />
                </BlockStack>
            </BlockStack>
        </Card>
    );
}