import React, { useState, useEffect } from "react";
import { Page, Layout, Card, InlineStack, Badge, Tabs, Text, BlockStack } from "@shopify/polaris";
import ReferralForm from "../../components/ReferralRegistrationForm/index";
import ReferralList from "../../components/ReferralsList";

const Referrals = () => {
  const [selected, setSelected] = useState(0);
  const handleTabChange = (index) => setSelected(index);
  const tabs = [
    {
      id: "referral-list",
      content: "Referral List",
      panelID: "referral-list-content",
    },
    {
      id: "add-referral",
      content: "Add Referral",
      panelID: "add-referral-content",
    },

  ];
  return (
    <Page title="Referrals" subtitle="Add new referrals and manage existing referral submissions.">
      <Layout>

        {/* Summary section */}
        <Layout.Section>
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
            <Card sectioned>
              {selected === 0 && (
                <ReferralList />
              )}

              {selected === 1 && (
                <Layout>
                  <Layout.Section>
                    <BlockStack gap="300">
                      <Text variant="headingMd">Add Referral</Text>
                      <Text>
                        Enter the referral details below to create a new referral entry.
                      </Text>
                      <ReferralForm />
                    </BlockStack>
                  </Layout.Section>
                </Layout>
              )}
            </Card>
          </Tabs>
        </Layout.Section>

      </Layout>
    </Page>
  );
};

export default Referrals;
