export const processPayment = async (userData) => {
    try {
        // Get username from localStorage
        const username = localStorage.getItem('temp_username');
        if (!username) {
            return {
                success: false,
                message: 'Username not found. Please try searching again.'
            };
        }

        const API_URL = import.meta.env.VITE_API_URL || 'https://plot-geek-vehicle-pathology.trycloudflare.com';
        const response = await fetch(`${API_URL}/api/payment/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ 
                username,
                userData: { ...userData, finalPrice: userData.finalPrice || userData.price } 
            })
        });

        const result = await response.json();


        if (result.code === 0 && result.msg === '成功' && result.data && result.data.url) {
            // Store order ID in localStorage if it exists in the response
            if (result.data.mch_order_no) {
                localStorage.setItem('order_id', result.data.mch_order_no);
            }
            return {
                success: true,
                url: result.data.url,
                message: 'Opening payment page...'
            };
        } else {
            return {
                success: false,
                message: result.msg || 'Payment failed. Please try again.'
            };
        }
    } catch (error) {
        console.error('Payment error:', error);
        return {
            success: false,
            message: 'Payment failed. Please try again.'
        };
    }
}; 
