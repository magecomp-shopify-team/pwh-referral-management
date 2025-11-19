<?php

namespace App\Jobs;

use Osiset\ShopifyApp\Actions\CancelCurrentPlan;
use Osiset\ShopifyApp\Contracts\Commands\Shop as IShopCommand;
use Osiset\ShopifyApp\Contracts\Queries\Shop as IShopQuery;
use Osiset\ShopifyApp\Messaging\Events\AppUninstalledEvent;
use Osiset\ShopifyApp\Objects\Values\ShopDomain;
use Osiset\ShopifyApp\Util;
use stdClass;
class AppUninstalledJob extends \Osiset\ShopifyApp\Messaging\Jobs\AppUninstalledJob
{

    /**
     * Execute the job.
     *
     * @param IShopCommand      $shopCommand             The commands for shops.
     * @param IShopQuery        $shopQuery               The querier for shops.
     * @param CancelCurrentPlan $cancelCurrentPlanAction The action for cancelling the current plan.
     *
     * @return bool
     */
    public function handle(
        IShopCommand $shopCommand,
        IShopQuery $shopQuery,
        CancelCurrentPlan $cancelCurrentPlanAction
    ): bool {
        info("uninstall called");
        // Convert the domain
        $this->domain = ShopDomain::fromNative($this->domain);

        // Get the shop
        $shop = $shopQuery->getByDomain($this->domain);
        $shopId = $shop->getId();

        $id = $shopId->toNative();

        // Cancel the current plan
        $cancelCurrentPlanAction($shopId);

        // Purge shop of token, plan, etc. 
        $shopCommand->clean($shopId);

        // Check freemium mode
        if (Util::getShopifyConfig('billing_freemium_enabled') === true) {
            // Add the freemium flag to the shop
            $shopCommand->setAsFreemium($shopId);
        }

        // Soft delete the shop.
        $shopCommand->softDelete($shopId);

        event(new AppUninstalledEvent($shop));

        return true;
    }
}
