import { defineStore } from "pinia";
import axios from "axios";
import router from "../router";
import Swal from "sweetalert2";

const base_url = "http://localhost:3000/pub";
export const useProductStore = defineStore("product", {
  state: () => ({
    products: [],
    product: {},
    bookmark: [],
    booking: false,
    qrCode: {},
    categories: [],
    filter: "",
    search: "",
    totalPrice: 0,
  }),
  actions: {
    async fetchProduct(page = 1 /*default*/) {
      try {
        let data = await axios.get(
          `${base_url}/products?page=${page}&&search=${this.search}&&filter=${this.filter}`
        );
        this.booking = false;
        this.products = data.data;
        this.filter = "";
        this.search = "";
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "error fetch product",
          icon: "error",
          confirmButtonText: "ok",
        });
      }
    },
    async fetchProductById(id) {
      try {
        let data = await axios.get(`${base_url}/products/${id}`);
        console.log(data.data.oneProduct, `<<<<<`);
        this.product = data.data.oneProduct;
        router.push(`/products/${id}`);
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "error fetch product by id",
          icon: "error",
          confirmButtonText: "ok",
        });
      }
    },
    async bookmarkedProducts(id) {
      try {
        await axios.post(
          `${base_url}/bookmarks/${id}`,
          {},
          {
            headers: {
              access_token: localStorage.getItem("access_token"),
            },
          }
        );
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Bookmarked",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: `${error.response.data.msg}`,
          icon: "error",
          confirmButtonText: "ok",
        });
      }
    },
    async readBookmarkedProduct() {
      try {
        let data = await axios.get(`${base_url}/bookmarks`, {
          headers: {
            access_token: localStorage.getItem("access_token"),
          },
        });

        data.data.readBooked.forEach((el) => {
          this.totalPrice += el.Product.price;
        });
        this.totalPrice = this.totalPrice.toLocaleString("id-ID")
        this.booking = true;
        this.bookmark = data.data.readBooked;
      } catch (error) {
        console.log(error);
      }
    },
    async generateQrCode(id) {
      try {
        const { data } = await axios({
          method: "GET",
          url: "https://api.happi.dev/v1/qrcode",
          params: {
            apikey: "2c0f73JThrX7TmHIy3gYdbObuiMuHwaUa5fihJCLmIp0daHEcEyiaFEC",
            data: `${base_url}/customers/accommodations/${id}`,
          },
        });
        this.qrCode = data;
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: `${error}`,
          icon: "error",
          confirmButtonText: "ok",
        });
      }
    },
    async showCategories() {
      try {
        let { data } = await axios.get(`${base_url}/categories`);
        this.categories = data.dataCategories;
      } catch (error) {
        console.log(error);
      }
    },
    async checkout() {
      try {
        const { data } = await axios({
          url: base_url + `/midtrans`,
          method: "POST",
          headers: {
            access_token: localStorage.getItem("access_token"),
          },
        });
        window.snap.pay(data.token, {
          onSuccess: function (result) {
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Payment Success",
              showConfirmButton: false,
              timer: 1500,
            });
            this.totalPrice = 0;
          },
        });
        
      } catch (error) {
        console.log(error);
      }
    },
    async deleteBookmarkedProduct(id) {
      try {
        await axios({
          url: base_url + `/bookmarks/${id}`,
          method: "DELETE",
          headers: {
            access_token: localStorage.getItem("access_token"),
          },
        });
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Remove Bookmark",
          showConfirmButton: false,
          timer: 1000,
        });
        this.readBookmarkedProduct();
      } catch (error) {
        console.log(error);
      }
    },
    async deleteBookmarkByCustomerId(){
      try {
        
      } catch (error) {
        console.log(error)
      }
    }
  },
});
