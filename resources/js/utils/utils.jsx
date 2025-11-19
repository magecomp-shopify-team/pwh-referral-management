import { useAppBridge } from "@shopify/app-bridge-react";


export const fetchApi = async (method, url, options = {}) => {    
    try {
        const m = method.toUpperCase();
        var option = {};
        if ((m != "GET" || m != "DELETE") && options?.body) {
            option.body = JSON.stringify(options.body);
        }
        option.headers = {
            "Content-Type": "application/json",
        };
        if (options?.headers) {
            option.headers = {
                ...option.headers,
                ...options?.headers,
            };
        }
        const response = await fetch(url, {
            method: method,
            ...option,
        });        
        return await response.json();
    } catch (error) {
        console.error("ERROR IN API CALL ::", error);
        return null;
    }
};

export const getRedirectUrl = (url) => {
    const shopify_data = useAppBridge();
    return `${url}?shop=${shopify_data.config.shop}`;
}


export function deepEqual(object1, object2) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            areObjects && !deepEqual(val1, val2) ||
            !areObjects && val1 !== val2
        ) {
            return false;
        }
    }
    return true;
}

function isObject(object) {
    return object != null && typeof object === 'object';
}
