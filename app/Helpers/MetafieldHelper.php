<?php

namespace App\Helpers;

use Carbon\Carbon;

class MetafieldHelper
{
    public static function setCustomerMetafield($user, array $data)
    {
        try {
            $api = $user->api();

            $customerId = $data['customer_id'];
            $ownerId = is_numeric($customerId)
                ? "gid://shopify/Customer/{$customerId}"
                : $customerId;

            $appliedDate = isset($data['applied_date'])
                ? Carbon::parse($data['applied_date'])
                : Carbon::now();

            $timePeriod = $data['time_period'] ?? 10;
            $expireDate = $appliedDate->copy()->addDays($timePeriod);

            $jsonValue = json_encode([
                'referral_code' => $data['referral_code'],
                'start_date' => $appliedDate->toDateString(),
                'expire_date' => $expireDate->toDateString(),
                'discount' => $data['discount'],
            ]);

            $query = <<<GRAPHQL
                mutation customerUpdate(\$input: CustomerInput!) {
                    customerUpdate(input: \$input) {
                        customer {
                            id
                            metafields(first: 10) {
                                nodes {
                                    id
                                    namespace
                                    key
                                    value
                                    type
                                }
                            }
                        }
                        userErrors {
                            field
                            message
                        }
                    }
                }
                GRAPHQL;

            $variables = [
                'input' => [
                    'id' => $ownerId,
                    'metafields' => [
                        [
                            'namespace' => 'custom',
                            'key' => 'referral_data',
                            'type' => 'json',
                            'value' => $jsonValue,
                        ]
                    ]
                ]
            ];

            $response = $api->graph($query, $variables);
            $customer = $response['body']['data']['customerUpdate']['customer'] ?? [];

            return [
                'success' => true,
                'data' => $customer,
            ];

        } catch (\Exception $e) {
            info('Metafield Error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public static function removeReferralMetafield($user, $customerId)
    {
        $api = $user->api();
        $ownerId = is_numeric($customerId) ? "gid://shopify/Customer/{$customerId}" : $customerId;

        $metafieldId = self::getReferralMetafieldId($api, $ownerId);
        if (!$metafieldId) {
            return ['success' => false, 'error' => 'no_metafield_found'];
        }

        self::deleteMetafield($api, $ownerId);

        self::createExpiredMetafield($user, $customerId);

    }

    /**
     * Get referral metafield ID only
     */
    private static function getReferralMetafieldId($api, $ownerId)
    {
        $query = <<<GRAPHQL
                    query {
                        customer(id: "$ownerId") {
                            metafields(first: 10) {
                                nodes {
                                    id
                                    namespace
                                    key
                                }
                            }
                        }
                    }
                    GRAPHQL;

        $response = $api->graph($query);
        $metafields = $response['body']['data']['customer']['metafields']['nodes'] ?? [];

        foreach ($metafields as $metafield) {
            if ($metafield['namespace'] === 'custom' && $metafield['key'] === 'referral_data') {
                return $metafield['id'];
            }
        }

        return null;
    }

    /**
     * Delete metafield by ID
     */
    private static function deleteMetafield($api, $ownerId)
    {
        $query = <<<GRAPHQL
                    mutation metafieldsDelete {
                    metafieldsDelete(
                        metafields: [
                        {
                            ownerId: "$ownerId"
                            namespace: "custom"
                            key: "referral_data"
                        }
                        ]
                    ) {
                        deletedMetafields {
                        ownerId
                        namespace
                        key
                        }
                        userErrors {
                        field
                        message
                        }
                    }
                    }
                    GRAPHQL;

        $response = $api->graph($query);

        if (!empty($response['errors'])) {
            return ['success' => false, 'errors' => $response['errors']];
        }

        $data = $response['body']['data']['metafieldsDelete'] ?? [];

        if (!empty($data['userErrors'])) {
            return ['success' => false, 'errors' => $data['userErrors']];
        }

        $deleted = $data['deletedMetafields'] ?? [];

        return [
            'success' => true,
            'deletedMetafields' => $deleted,
        ];
    }

    public static function createExpiredMetafield($user, $customerId)
    {
        try {
            $api = $user->api();
            $ownerId = is_numeric($customerId) ? "gid://shopify/Customer/{$customerId}" : $customerId;

            $expiredValue = ['expired' => true];
            $jsonValue = json_encode($expiredValue);

            $query = <<<GRAPHQL
                    mutation customerUpdate(\$input: CustomerInput!) {
                        customerUpdate(input: \$input) {
                            customer {
                                id
                            }
                            userErrors {
                                field
                                message
                            }
                        }
                    }
                    GRAPHQL;

            $variables = [
                'input' => [
                    'id' => $ownerId,
                    'metafields' => [
                        [
                            'namespace' => 'custom',
                            'key' => 'referral_data',
                            'type' => 'json',
                            'value' => $jsonValue,
                        ]
                    ]
                ]
            ];

            $response = $api->graph($query, $variables);

            $errors = $response['body']['data']['customerUpdate']['userErrors'] ?? [];

            if (!empty($errors)) {
                return [
                    'success' => false,
                    'errors' => $errors,
                ];
            }

            return [
                'success' => true,
                'message' => 'Expired metafield created successfully'
            ];

        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    public static function createFunctionDiscount($user, $functionId, $title = "Referral Discount")
    {
        $api = $user->api();

        $query = <<<GRAPHQL
        mutation discountAutomaticAppCreate(\$automaticAppDiscount: DiscountAutomaticAppInput!) {
            discountAutomaticAppCreate(automaticAppDiscount: \$automaticAppDiscount) {
                automaticAppDiscount {
                    title
                    status
                }
                userErrors {
                    field
                    message
                }
            }
        }
    GRAPHQL;

        $variables = [
            'automaticAppDiscount' => [
                'title' => $title,
                'functionId' => $functionId,
                'discountClasses' => ['ORDER'],
                'combinesWith' => [
                    'orderDiscounts' => true,
                    'productDiscounts' => false,
                    'shippingDiscounts' => false
                ],
                'startsAt' => now()->toISOString()
            ]
        ];

        $response = $api->graph($query, $variables);
        info($response);
        $userErrors = $response['body']['data']['discountAutomaticAppCreate']['userErrors'] ?? [];

        if (!empty($userErrors)) {
            return [
                'status' => 0,
                'message' => $userErrors[0]['message'] ?? 'Failed to create discount'
            ];
        }

        return [
            'status' => 1,
            'message' => 'Discount created successfully',
            'data' => $response['body']['data']['discountAutomaticAppCreate']['automaticAppDiscount'] ?? []
        ];
    }

    public static function getAppFunctions($user)
    {
        $api = $user->api();

        $query = <<<'GRAPHQL'
        query {
            shopifyFunctions(first: 25) {
                nodes {
                    id
                    title
                    apiType
                }
            }
        }
        GRAPHQL;

        $response = $api->graph($query);

        $functions = $response['body']['data']['shopifyFunctions']['nodes'] ?? [];

        return json_encode($functions) ?? null;
    }

    public static function getOrderDetails($user, $orderGid)
    {
        $api = $user->api();

        $query = <<<GRAPHQL
        query getOrder(\$id: ID!) {
            order(id: \$id) {
                id
                name
                email
                currencyCode
                totalPriceSet {
                    shopMoney {
                        amount
                        currencyCode
                    }
                }
                totalDiscountsSet {
                    shopMoney {
                        amount
                        currencyCode
                    }
                }
                discountApplications(first: 10) {
                    edges {
                        node {
                            __typename
                            allocationMethod
                            targetType
                            # MOVE TITLE INSIND SPECIFIC TYPES
                            ... on DiscountCodeApplication {
                                code
                                value {
                                    ... on MoneyV2 {
                                        amount
                                        currencyCode
                                    }
                                    ... on PricingPercentageValue {
                                        percentage
                                    }
                                }
                            }
                            ... on AutomaticDiscountApplication {
                                title
                                value {
                                    ... on MoneyV2 {
                                        amount
                                        currencyCode
                                    }
                                    ... on PricingPercentageValue {
                                        percentage
                                    }
                                }
                            }
                            ... on ManualDiscountApplication {
                                title
                                value {
                                    ... on MoneyV2 {
                                        amount
                                        currencyCode
                                    }
                                    ... on PricingPercentageValue {
                                        percentage
                                    }
                                }
                            }
                            ... on ScriptDiscountApplication {
                                title
                                value {
                                    ... on MoneyV2 {
                                        amount
                                        currencyCode
                                    }
                                    ... on PricingPercentageValue {
                                        percentage
                                    }
                                }
                            }
                        }
                    }
                }
                lineItems(first: 10) {
                    edges {
                        node {
                            title
                            quantity
                            discountedUnitPriceSet {
                                shopMoney {
                                    amount
                                    currencyCode
                                }
                            }
                            discountAllocations {
                                allocatedAmountSet {
                                    shopMoney {
                                        amount
                                        currencyCode
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        GRAPHQL;

        $variables = [
            'id' => $orderGid
        ];

        $response = $api->graph($query, $variables);
        return $response;
    }

    public static function getCustomerCreationDate($user, $customerId)
    {
        $api = $user->api();

        $query = '
        query GetCustomerCreationDate($id: ID!) {
            customer(id: $id) {
                id
                email
                createdAt
                metafields(first: 10) {
                    nodes {
                        id
                        namespace
                        key
                        value
                        type
                    }
                }
            }
        }
    ';

        $variables = [
            'id' => "gid://shopify/Customer/{$customerId}"
        ];

        $response = $api->graph($query, $variables);

        if (isset($response['errors'])) {
            return response()->json([
                'status' => 0,
                'message' => 'GraphQL error',
                'error' => $response['errors']
            ], 500);
        }

        $customerData = $response['body']['data']['customer'];

        $createdAt = $customerData['createdAt'];

        return $createdAt;
    }
}