import { IndexTable, IndexFilters, useIndexResourceState, useSetIndexFiltersMode, Tooltip, InlineStack, Button, Text, Box, } from "@shopify/polaris";
import { EditIcon, DeleteIcon, ViewIcon } from "@shopify/polaris-icons";
import { useState, useEffect, useCallback } from "react";
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import ReferralEditForm from "../ReferralEditForm";
import ReferralDetails from "../ViewReferralDetails/index";

export default function ReferralList() {
    const [referrals, setReferrals] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { mode, setMode } = useSetIndexFiltersMode();
    const [editingId, setEditingId] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [viewId, setViewId] = useState(null);

    const [editedFormData, setEditedFormData] = useState({});

    const handleSaveReferral = async () => {
        try {
            const res = await fetch(`/api/update-referral/${editingId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editedFormData),
            });
            const data = await res.json();
            if (data.status == 1) {
                fetchReferrals();
                shopify.modal.hide('edit-modal');
                shopify.toast.show("Details updated");
            }
            else {
                shopify.modal.hide('edit-modal');
                shopify.toast.show("Failed to update details", { isError: true });
            }
        } catch (error) {
            console.error("Error saving referral:", error);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(`/api/delete-referral/${deleteId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.status == 1) {
                fetchReferrals();
                shopify.modal.hide('delete-modal');
                shopify.toast.show("Referral deleted");
            }
            else {
                shopify.modal.hide('edit-modal');
                shopify.toast.show("Failed to delete referral", { isError: true });
            }
        } catch (error) {
            console.error("Error saving referral:", error);
        }
    };

    useEffect(() => {
        fetchReferrals();
    }, []);

    const fetchReferrals = async () => {
        try {
            const response = await fetch("/api/get-referrals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            const list = Array.isArray(data.data) ? data.data : [];
            setReferrals(list);
            setFilteredData(list);
        } catch (error) {
            console.error("Error fetching referrals:", error);
        }
    };

    const handleSearch = useCallback(
        (value) => {
            setSearchValue(value);
            if (!value.trim()) {
                setFilteredData(referrals);
            } else {
                const lower = value.toLowerCase();
                const filtered = referrals.filter(
                    (item) =>
                        item.first_name?.toLowerCase().includes(lower) ||
                        item.email?.toLowerCase().includes(lower) ||
                        item.phone?.toLowerCase().includes(lower) ||
                        item.referral_code?.toLowerCase().includes(lower)
                );
                setFilteredData(filtered);
            }
            setCurrentPage(1);
        },
        [referrals]
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = filteredData.slice(startIndex, startIndex + itemsPerPage);
    const hasNext = currentPage * itemsPerPage < filteredData.length;
    const hasPrevious = currentPage > 1;

    const resourceName = { singular: "referral", plural: "referrals" };

    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(currentItems);

    const rowMarkup = currentItems.map((item, index) => (
        <IndexTable.Row
            id={item.id}
            key={item.id}
            selected={selectedResources.includes(item.id)}
            position={index}
        >
            <IndexTable.Cell className="text-length">
                <Tooltip content={item.first_name + " " + item.last_name}>
                    <Text variant="bodyMd" fontWeight="semibold">
                        {item.first_name} {item.last_name}
                    </Text>
                </Tooltip>
            </IndexTable.Cell>
            <IndexTable.Cell className="text-length"><Tooltip content={item.email}><Text variant="bodyLg" as="p" truncate>{item.email}</Text></Tooltip></IndexTable.Cell>
            <IndexTable.Cell className="text-length"><Text variant="bodyLg" as="p" truncate>{item.phone}</Text></IndexTable.Cell>
            <IndexTable.Cell className="text-length"><Tooltip content={item.referral_code}><Text variant="bodyLg" as="p" truncate>{item.referral_code}</Text></Tooltip></IndexTable.Cell>
            <IndexTable.Cell>
                <InlineStack gap="200">
                    <Button
                        icon={ViewIcon}
                        variant="plain"
                        onClick={() => {
                            setViewId(item.id);
                            shopify.modal.show('view-modal');
                        }}
                    />
                    <Button
                        icon={EditIcon}
                        variant="plain"
                        onClick={() => {
                            setEditingId(item.id);
                            shopify.modal.show('edit-modal');
                        }}
                    />
                    <Button
                        icon={DeleteIcon}
                        tone="critical"
                        variant="plain"
                        onClick={() => {
                            setDeleteId(item.id);
                            shopify.modal.show('delete-modal');
                        }}
                    />
                </InlineStack>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    const filters = [];
    const tabs = [];

    return (
        <>
            <Modal id="edit-modal" variant="large">
                <TitleBar title="Edit Details" >
                    <button onClick={handleSaveReferral} variant="primary">Update</button>
                </TitleBar>
                <ReferralEditForm
                    referralId={editingId}
                    onFormChange={setEditedFormData}
                />
            </Modal>

            <Modal id="view-modal">
                <TitleBar title="View Details" />
                <ReferralDetails referralId={viewId} />
            </Modal>

            <Modal id="delete-modal">
                <TitleBar title="Confirm Action">
                    <button onClick={handleDelete} tone="critical">Delete</button>
                </TitleBar>
                <Box paddingBlock={400} paddingInlineStart={400}>
                    <Text variant="headingMd">Are you sure want to delete?</Text>
                </Box>
            </Modal>

            <IndexFilters
                queryValue={showSearchBar ? searchValue : undefined}
                queryPlaceholder="Search referrals"
                onQueryChange={handleSearch}
                onQueryClear={() => {
                    handleSearch("");
                    setShowSearchBar(false);
                }}
                mode={mode}
                setMode={setMode}
                filters={filters}
                tabs={tabs}
                hideFilters={false}
                onToggleAll={() => { }}
                cancelAction={{
                    onAction: () => {
                        handleSearch("");
                        setShowSearchBar(false);
                    },
                    disabled: false,
                }}
                onQueryFocus={() => setShowSearchBar(true)}
            />

            <IndexTable
                resourceName={resourceName}
                itemCount={filteredData.length}
                selectedItemsCount={
                    allResourcesSelected ? "All" : selectedResources.length
                }
                onSelectionChange={handleSelectionChange}
                headings={[
                    { title: "Name" },
                    { title: "Email" },
                    { title: "Phone" },
                    { title: "Referral Code" },
                    { title: "Action" },
                ]}
                pagination={{
                    hasNext,
                    onNext: () => setCurrentPage((prev) => prev + 1),
                    hasPrevious,
                    onPrevious: () => setCurrentPage((prev) => prev - 1),
                }}
            >
                {rowMarkup}
            </IndexTable>
        </>
    );
}
