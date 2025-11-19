import React, { useEffect, useState } from "react";
import { Card, Text, BlockStack, InlineGrid, Badge, Box, Page, Icon, IndexTable, } from "@shopify/polaris";
import { PersonIcon, EmailIcon, HashtagIcon, CalendarIcon, ClockIcon } from "@shopify/polaris-icons";

export default function ReferrerAnalytics({ referralAnalytics }) {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ROWS_PER_PAGE = 10;

    const StatCard = ({ icon, label, value, tone = "default", }) => (
        <Box background="bg-surface" borderRadius="300" border="border-divider">
            <BlockStack gap="100">
                <InlineGrid columns="auto 1fr" alignItems="center" gap="200">
                    <Icon source={icon} tone="subdued" />
                    <Text tone="subdued" variant="bodySm" fontWeight="medium">{label}</Text>
                </InlineGrid>
                <Box paddingInlineStart={800}>
                    <Text variant="headingLg" as="h3" fontWeight="bold" tone={tone}>
                        {value}
                    </Text>
                </Box>
            </BlockStack>
        </Box>
    );

    const InfoItem = ({ icon, label, value, isBadge = false, badgeTone = "success" }) => (
        <Box>
            <InlineGrid columns="auto 1fr" gap="200" alignItems="center">
                <Icon source={icon} tone="subdued" />
                <Text tone="subdued" variant="bodyMd" fontWeight="medium">{label}</Text>
            </InlineGrid>
            <Box paddingInlineStart="500">
                {isBadge ? (
                    <Box paddingInlineStart={200}>
                        <Badge tone={badgeTone} size="large">
                            {value}
                        </Badge>
                    </Box>
                ) : (
                    <Box paddingInlineStart={200}>
                        <Text fontWeight="semibold" variant="bodyMd">
                            {value}
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    );

    const fetchReferralData = async () => {
        try {
            setLoading(true);
            setCurrentPage(1);
            const response = await fetch(`/api/get-referral-analytics/${referralAnalytics}`);
            const data = await response.json();

            if (data.status === 1) {
                setFormData(data.data);
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching referral:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (referralAnalytics) {
            fetchReferralData();
        }
    }, [referralAnalytics]);


    const referredCustomers = formData?.referredCustomers || [];
    const totalRows = referredCustomers.length;
    const totalBeforeDiscount = parseFloat(formData?.totalBeforeDiscount ?? 0);
    const totalAfterDiscount = parseFloat(formData?.totalAfterDiscount ?? 0);
    const totalRevenue = parseFloat(formData?.totalDiscount ?? 0);

    // Calculate pagination
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const paginatedCustomers = referredCustomers.slice(startIndex, startIndex + ROWS_PER_PAGE);

    const hasNext = currentPage < totalPages;
    const hasPrevious = currentPage > 1;

    const resourceName = {
        singular: 'customer',
        plural: 'customers',
    };

    const rowMarkup = paginatedCustomers.map(
        (customer, index) => (
            <IndexTable.Row
                id={customer.id}
                key={customer.id}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {customer.customer_name}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" as="span">
                        {customer.customer_email}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" as="span">
                        {customer.code_applied_date ? new Date(customer.code_applied_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }) : ""}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" as="span">
                        {customer.expire_date != "expired" ? new Date(customer.expire_date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                        }) : <Badge tone="critical">
                            Expired
                        </Badge>}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {customer.expire_date == 'expired' ?
                        <Badge tone="critical">
                            Expired
                        </Badge>
                        :
                        <Badge tone="success">
                            Active
                        </Badge>}
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

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

    if (!formData) {
        return (
            <Page title="Referrer Information">
                <Card>
                    <Box padding="400">
                        <Text variant="bodyMd" as="p" alignment="center">
                            No referral data found.
                        </Text>
                    </Box>
                </Card>
            </Page>
        );
    }

    const { referralData } = formData;
    const referral = referralData?.referral;

    const totalReferrals = referredCustomers.length;

    const expiredCustomers = referredCustomers.filter(customer =>
        customer.expire_date == "expired"
    ).length;

    const billingSummary = {
        beforeDiscount: "2,400",
        afterDiscount: "1,920",
        totalDiscount: "480",
        averageOrderValue: "200"
    };

    return (
        <Page title="Referrer Information">
            <Box paddingBlockEnd={200}>
                <BlockStack gap="500">
                    <Card padding="400">
                        <BlockStack gap="400">
                            <InlineGrid columns={3} gap="400">
                                <InfoItem
                                    icon={PersonIcon}
                                    label="Full Name"
                                    value={`${referral?.first_name || ''} ${referral?.last_name || ''}`.trim()}
                                />
                                <InfoItem
                                    icon={EmailIcon}
                                    label="Email Address"
                                    value={referral?.email || ''}
                                />
                                <InfoItem
                                    icon={HashtagIcon}
                                    label="Referral Code"
                                    value={referralData?.referral_code}
                                    isBadge={true}
                                />
                            </InlineGrid>
                        </BlockStack>
                    </Card>

                    <Card padding="400">
                        <BlockStack gap="400">
                            <Text variant="headingLg" as="h2" fontWeight="bold">
                                Referral Analytics
                            </Text>
                            <InlineGrid columns={3} gap="400">
                                <StatCard
                                    icon={PersonIcon}
                                    label="Total Referrals"
                                    value={totalReferrals}
                                    tone="success"
                                />
                                <StatCard
                                    icon={ClockIcon}
                                    label="Expired Customers"
                                    value={expiredCustomers}
                                    tone="critical"
                                />

                                <StatCard
                                    icon={CalendarIcon}
                                    label="Active Since"
                                    value={referral?.created_at ? new Date(referral?.created_at).toLocaleDateString("en-GB", {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                    }) : ""}
                                    tone="subdued"
                                />
                            </InlineGrid>
                        </BlockStack>
                    </Card>

                    <Card padding="0">
                        <BlockStack gap="400">
                            <Box padding="400">
                                <Text variant="headingLg" as="h2" fontWeight="bold">
                                    Referred Customer Details ({totalRows})
                                </Text>
                            </Box>

                            <IndexTable
                                resourceName={resourceName}
                                itemCount={paginatedCustomers.length}
                                headings={[
                                    { title: "Name" },
                                    { title: "Email" },
                                    { title: "Joined Date" },
                                    { title: "Expiry Date" },
                                    { title: "Status" },
                                ]}
                                selectable={false}
                                pagination={{
                                    hasNext,
                                    onNext: () => setCurrentPage((prev) => prev + 1),
                                    hasPrevious,
                                    onPrevious: () => setCurrentPage((prev) => prev - 1),
                                }}
                            >
                                {rowMarkup}
                            </IndexTable>
                        </BlockStack>
                    </Card>

                    {/* 4. Billing Summary */}
                    <Card padding="400">
                        <BlockStack gap="400">
                            <Text variant="headingLg" as="h2" fontWeight="bold">
                                Billing Summary
                            </Text>
                            <InlineGrid columns={3} gap="400">
                                <Box background="bg-subdued" padding="400" borderRadius="200">
                                    <BlockStack gap="200" align="center">
                                        <Text tone="subdued" variant="bodySm" fontWeight="medium">Before Discount</Text>
                                        <Text variant="headingXl" fontWeight="bold" tone="subdued">
                                            ₹{totalBeforeDiscount}
                                        </Text>
                                    </BlockStack>
                                </Box>

                                <Box background="bg-success-subdued" padding="400" borderRadius="200">
                                    <BlockStack gap="200" align="center">
                                        <Text tone="success" variant="bodySm" fontWeight="medium">After Discount</Text>
                                        <Text variant="headingXl" fontWeight="bold" tone="success">
                                            ₹{totalAfterDiscount}
                                        </Text>
                                    </BlockStack>
                                </Box>

                                <Box background="bg-info-subdued" padding="400" borderRadius="200">
                                    <BlockStack gap="200" align="center">
                                        <Text tone="info" variant="bodySm" fontWeight="medium">Total Discount Given</Text>
                                        <Text variant="headingXl" fontWeight="bold" tone="info">
                                            ₹{totalRevenue}
                                        </Text>
                                    </BlockStack>
                                </Box>
                            </InlineGrid>
                        </BlockStack>
                    </Card>
                </BlockStack>
            </Box>
        </Page>
    );
}