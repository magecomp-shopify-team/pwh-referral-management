import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
    Page,
    IndexTable,
    Text,
    Badge,
    Button,
    Card,
    useIndexResourceState,
    IndexFilters,
    useSetIndexFiltersMode,
} from "@shopify/polaris";
import ReferrerAnalytics from "../ReferralAnalyticsDashboard";
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';

export default function ReferralsIndexTable() {
    const [referrals, setReferrals] = useState([]);
    const [queryValue, setQueryValue] = useState('');
    const [sortSelected, setSortSelected] = useState(['name_asc']);
    const [page, setPage] = useState(0);
    const itemsPerPage = 5;
    const { mode, setMode } = useSetIndexFiltersMode();
    const [referralAnalytics, setReferralAnalytics] = useState(null);

    const fetchReferralData = async () => {
        try {
            const response = await fetch('/api/referrals-list-for-analytics');
            const data = await response.json();
            if (data.status === 1 && Array.isArray(data.data)) {
                const formattedData = data.data.map((item) => ({
                    id: item.id,
                    name: (item.first_name + " " + item.last_name || "").trim(),
                    email: item.email || "",
                    status: item.status || "",
                    referrals: item.applies_count || 0,
                    joinDate: item.created_at
                        ? new Date(item.created_at).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        })
                        : "",

                }));
                setReferrals(formattedData);
            } else {
                setReferrals([]);
            }
        } catch (error) {
            console.error("Error fetching referral list:", error);
        }
    };

    useEffect(() => {
        fetchReferralData();
    }, []);

    const handleSearch = useCallback((value) => {
        setQueryValue(value);
        setPage(0);
    }, []);

    const sortOptions = [
        { label: 'Name A-Z', value: 'name_asc' },
        { label: 'Name Z-A', value: 'name_desc' },
        { label: 'Status (Active first)', value: 'status_active' },
        { label: 'Status (Pending first)', value: 'status_pending' },
        { label: 'Status (Inactive first)', value: 'status_inactive' },
        { label: 'Performance (High to Low)', value: 'performance_desc' },
        { label: 'Performance (Low to High)', value: 'performance_asc' },
    ];


    const filteredAndSortedReferrals = useMemo(() => {
        const filtered = referrals.filter((referral) => {
            return queryValue === '' ||
                referral.name.toLowerCase().includes(queryValue.toLowerCase()) ||
                referral.email.toLowerCase().includes(queryValue.toLowerCase());
        });

        return [...filtered].sort((a, b) => {
            const sortValue = sortSelected[0];

            switch (sortValue) {
                case 'name_asc':
                    return a.name.localeCompare(b.name);
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'status_active':
                    const statusOrderActive = { 'active': 1, 'pending': 2, 'inactive': 3 };
                    return (statusOrderActive[a.status] || 4) - (statusOrderActive[b.status] || 4);
                case 'status_pending':
                    const statusOrderPending = { 'pending': 1, 'active': 2, 'inactive': 3 };
                    return (statusOrderPending[a.status] || 4) - (statusOrderPending[b.status] || 4);
                case 'status_inactive':
                    const statusOrderInactive = { 'inactive': 1, 'active': 2, 'pending': 3 };
                    return (statusOrderInactive[a.status] || 4) - (statusOrderInactive[b.status] || 4);
                case 'performance_desc':
                    return b.referrals - a.referrals;
                case 'performance_asc':
                    return a.referrals - b.referrals;
                case 'newest':
                    return new Date(b.joinDate) - new Date(a.joinDate);
                case 'oldest':
                    return new Date(a.joinDate) - new Date(b.joinDate);
                default:
                    return 0;
            }
        });
    }, [referrals, queryValue, sortSelected]);

    const paginatedReferrals = filteredAndSortedReferrals.slice(
        page * itemsPerPage,
        (page + 1) * itemsPerPage
    );

    const totalPages = Math.ceil(filteredAndSortedReferrals.length / itemsPerPage);

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(paginatedReferrals);

    const handleViewAnalytics = useCallback((referralId) => {
        console.log("View analytics for referral:", referralId);
        <ReferrerAnalytics />
        // navigate(`/referral-analytics/${referralId}`);
    }, []);

    const rowMarkup = paginatedReferrals.map(
        ({ id, name, email, status, referrals, joinDate }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
            >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {name}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" as="span">
                        {email}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Badge
                        tone={
                            status.toLowerCase() === 'active'
                                ? 'success'
                                : status.toLowerCase() === 'pending'
                                    ? 'attention'
                                    : 'critical'
                        }
                    >
                        {status}
                    </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Text variant="bodyMd" as="span" tone="subdued">
                        {joinDate}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <Button
                        onClick={() => {
                            setReferralAnalytics(id);
                            shopify.modal.show("analytics-modal");
                        }}
                        size="micro"
                    >
                        View Analytics
                    </Button>

                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (

        <Page
            title="Dashboard"
            subtitle="Analyze your referral performance"
        >
            <Modal id="analytics-modal" variant="max">
                <TitleBar title="Edit Details" />

                <ReferrerAnalytics
                    referralAnalytics={referralAnalytics}
                />
            </Modal>
            <Card>
                <IndexFilters
                    queryValue={queryValue}
                    queryPlaceholder="Search by name or email"
                    onQueryChange={handleSearch}
                    onQueryClear={() => handleSearch("")}
                    mode={mode}
                    setMode={setMode}
                    filters={[]}
                    appliedFilters={[]}
                    onClearAll={() => setQueryValue('')}
                    cancelAction={{
                        onAction: () => handleSearch(""),
                        disabled: false,
                    }}
                    sortOptions={sortOptions}
                    sortSelected={sortSelected}
                    onSort={setSortSelected}
                    tabs={[]}
                />

                {filteredAndSortedReferrals.length > 0 && (
                    <div style={{
                        padding: '16px',
                        borderBottom: '1px solid #E1E3E5',
                    }}>
                        <Text variant="bodySm" tone="subdued">
                            {filteredAndSortedReferrals.length} {filteredAndSortedReferrals.length === 1 ? 'referral' : 'referrals'} found
                            {sortSelected[0] && ` • Sorted by ${sortOptions.find(opt => opt.value === sortSelected[0])?.label}`}
                        </Text>
                    </div>
                )}

                <IndexTable
                    resourceName={{ singular: 'referral', plural: 'referrals' }}
                    itemCount={paginatedReferrals.length}
                    selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
                    onSelectionChange={handleSelectionChange}
                    headings={[
                        { title: 'Name' },
                        { title: 'Email' },
                        { title: 'Status' },
                        { title: 'Registered On' },
                        { title: 'Actions' },
                    ]}
                    selectable={false}
                    pagination={{
                        hasNext: page < totalPages - 1,
                        hasPrevious: page > 0,
                        onNext: () => setPage(page + 1),
                        onPrevious: () => setPage(page - 1),
                    }}
                    emptyState={
                        <div style={{ padding: '40px', textAlign: 'center' }}>
                            <Text variant="bodyMd" tone="subdued">
                                No referrals found.
                            </Text>
                        </div>
                    }
                >
                    {rowMarkup}
                </IndexTable>

                {totalPages > 1 && (
                    <div style={{
                        padding: '16px',
                        textAlign: 'center',
                        borderTop: '1px solid #E1E3E5'
                    }}>
                        <Text variant="bodySm" tone="subdued">
                            Page {page + 1} of {totalPages} • Showing {paginatedReferrals.length} of {filteredAndSortedReferrals.length} referrals
                        </Text>
                    </div>
                )}
            </Card>
        </Page>
    );
}
