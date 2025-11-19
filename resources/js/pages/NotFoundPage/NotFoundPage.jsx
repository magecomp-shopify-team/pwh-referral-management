import { Box, InlineStack, Layout, Page, Text } from "@shopify/polaris";
import ErrorImg from "../../assets/img/error-404.svg";
import { useNavigate } from "react-router-dom";
import { getRedirectUrl } from "../../utils/utils";

const NotFoundPage = () => {
    const navigation = useNavigate();
    return (
        <Page
            title="404"
            backAction={{
                onAction: () => {
                    navigation(getRedirectUrl('/'));
                }
            }}
        >
            <Layout>
                <Layout.Section>
                    <div style={{ margin: "auto", maxWidth: "70%" }}>
                        <InlineStack blockAlign="center" align="center" gap={"300"}>
                            <Box width="30%">
                                <img src={ErrorImg} alt="404 - Error page" width="100%" />
                            </Box>
                            <Box width="60%">
                                <Text as="h2" variant="headingLg">No Page Found</Text>
                                <Text as="p" variant="bodyLg">Page is not found</Text>
                            </Box>
                        </InlineStack>
                    </div>
                </Layout.Section>
            </Layout>
        </Page>
    )
}

export default NotFoundPage;