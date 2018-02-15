
var app = new Vue({
    el: '#app',
    data: { 
            title: 'Pizza Menu',
            summaryTitle: 'Your Order',
            menu: undefined,
            productMap: {},
            orderedProductMap: {},
            summaryInfo: {
                coupon: 16,
                deliveryFee: 2.99,
                taxPercent: 9
            }
        
    },

    methods: {
        orderProduct: function(product){
            if(this.orderedProductMap[product.id]){
                this.orderedProductMap[product.id].count++;
            }else{
                this.$set(this.orderedProductMap, product.id, { product: product, count: 1});
            }
        },
        removeProduct: function(product){
            if(this.orderedProductMap[product.id]){
                this.orderedProductMap[product.id].count--;
                if(this.orderedProductMap[product.id].count === 0)
                    this.$delete(this.orderedProductMap, product.id);
            }
        },
        deleteOrder: function(product){
            if(this.orderedProductMap[product.id]){
                this.orderedProductMap[product.id].count = 0;
                this.$delete(this.orderedProductMap, product.id);
            }
        }
    },

    beforeMount() {
        var vm = this;
        return axios.get('https://api.myjson.com/bins/d7wgd')
        .then(response => {
            this.productMap = response.data
            console.log(this.productMap)
        })
        .catch(error => {
            console.log(error)
        })

    }
});

Vue.component('menuItem', {
    props: ['product'],
    data:function () {
        return {
            counter: 0
        }
    },
    template: `<div class="menu-item-container flex">
                    <img :src="product.menuAsset.url"></img>
                    <div class="item-description">
                        <div class="zume-font">
                            <h3>{{product.name}}<span v-if="product.vegetarian" class="icon-leaf icon-leaf-decorator"></span><h3>
                        </div>
                        <div class="zume-font">
                            <small><i>{{product.toppings.map((item) => item.name).toString().replace(/,/g,', ')}}</i></small>
                        </div>
                        <div>
                            <button class="icon-plus icon-plus-decorator" @click="addProduct(product)"></button>
                            <span class="price zume-font">{{'$'+product.price}}</span>
                        </div> 
                    </div>
                </div>`,
    methods: {
        addProduct: function(product){
            this.counter += 1;
            this.$emit('order-product', product);
        }

    }
});

Vue.component('orderList', {
    props: ['orderItem'],
    template: `<div class="order-item-container flex zume-font">
                    <img class="small-image" :src="orderItem.product.menuAsset.url"></img>
                    <div class="flex">
                        <small class="align-bottom">
                            <div>{{orderItem.product.name}}<span v-if="orderItem.product.vegetarian" class="icon-leaf icon-leaf-decorator"></span></div>
                            <div>
                                <button class="icon-plus summary-item-button" @click="addProduct(orderItem.product)"></button>
                                x{{orderItem.count}} 
                                <button class="icon-minus summary-item-button" @click="removeProduct(orderItem.product)"></button>
                                <button class="icon-bin summary-item-button" @click="deleteOrder(orderItem.product)"></button>
                            </div>
                        </small>
                    </div>
                    <div class="align-bottom">{{'$'+orderItem.count * orderItem.product.price}}</div>
                </div>`,
    methods: {
        addProduct: function(product){
            this.$emit('order-product', product);
        },
        removeProduct: function(product){
            this.$emit('remove-product', product);
        },
        deleteOrder: function(product){
            this.$emit('delete-order', product);
        }
    }
});

Vue.component('orderSummary', {
    props: ['orderedProductMap', 'summaryInfo'],
    template: `<div v-if="Object.values(orderedProductMap).length > 0" class="flex zume-font flex-column summary">
                    <hr class="flex-1" />
                    <div class="flex flex-1">
                        <span class="flex-1">SUBTOTAL</span>
                        <span>{{'$' + subtotal().toFixed(2)}}</span>
                    </div>
                    <div class="flex flex-1">
                        <span class="flex-1">COUPON</span>
                        <span>{{'-$' + summaryInfo.coupon.toFixed(2)}}</span>
                    </div>
                    <div class="flex flex-1">
                        <span class="flex-1">DELIVERY FEE</span>
                        <span>{{'$' + summaryInfo.deliveryFee.toFixed(2)}}</span>
                    </div>
                    <div class="flex flex-1">
                        <span class="flex-1">TAX</span>
                        <span>{{'$' + tax().toFixed(2)}}</span>
                    </div>                      
                    <hr class="flex-1" />
                    <div class="flex flex-1">
                        <span class="flex-1">TOTAL</span>
                        <span>{{'$' + (taxableTotal() + tax()).toFixed(2) }}</span>
                    </div>
                    <button class="checkout-btn">Checkout</button>                  
                </div>`,
    methods: {
        subtotal: function(){
            return Object.values(this.orderedProductMap).reduce((total, orderItem) => total + (orderItem.product.price * orderItem.count), 0);
        },
        taxableTotal: function(){
            return (this.subtotal() - this.summaryInfo.coupon + this.summaryInfo.deliveryFee);
        },
        tax: function(){
            return this.taxableTotal() * (this.summaryInfo.taxPercent/100);
        }
    }
});
