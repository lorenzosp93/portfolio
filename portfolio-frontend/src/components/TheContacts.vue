<template>
  <div class="container min-h-[55vh] lg:min-h-[60vh] relative flex w-screen mx-auto flex-wrap">
    <div class="class container flex flex-wrap mx-auto my-10">
      <h2 class="text-center mt-auto text-xl w-full font-bold mx-auto  text-gray-600 dark:text-white">
        Get in touch!
      </h2>
      <div @click="openForm" class="cursor-pointer bg-gray-400 dark:bg-gray-600 px-5 py-3 rounded-2xl font-semibold text-center mx-auto mb-auto mt-3 text-white dark:text-gray-300 shadow-md hover:scale-105 transition duration-300 ease-in" >
        Click here to send me a message.
      </div>
    </div>
    <detail-card :isOpen="formVisible" @card-closed="closeForm" ref='formCard'>
      <template v-slot:title > 
      <p>
        Contact form
      </p>
      </template>
      <template v-slot:subtitle > 
      <p>
        Send me a quick message!
      </p>
      </template>
      <template v-slot:extra-title-content > 
        <button v-if="!isLoading" @click.prevent="submitMessage" class="absolute right-3 py-2 px-5 mx-auto mt-auto mb-2 rounded-2xl text-semibold bg-gray-500 dark:bg-gray-600 dark:text-gray-300 text-white transition duration-300 ease-in opacity-50" :class="{'hover:scale-105 shadow-md opacity-100': canSubmit}" type="submit" :disabled="!canSubmit" >Send</button>
        <div class="absolute right-3 w-10 h-10 p-6 my-auto mr-5 flex bg-white dark:bg-gray-800 shadow-md container flex-none rounded-full" v-else >
          <svg role="status" class="absolute left-1 top-1 w-10 h-10 text-gray-100 animate-spin dark:text-gray-400 fill-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
          </svg>
        </div>
      </template>
      <template v-slot:inner-content >
        <form class="relative max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2" autocomplete="on">
          <div v-for="item in formItems" :key="item.id" class="mb-3 mx-auto">
            <label class="block mb-1 ml-1 text-base font-semibold text-gray-600 dark:text-gray-300 " :for="item.id">{{ item.label }}</label>
            <input v-if="item.type != 'textarea'" class="py-1 px-2 text-lg rounded-lg bg-gray-100 dark:bg-gray-300 text-gray-800 focus:shadow-inner placeholder:font-thin placeholder:dark:text-gray-500 caret-gray-800 outline-none" :class="{'invalid:ring-red-500 invalid:focus:ring-0 invalid:ring-2': item.value}"
              :type="item.type"
              :id="item.id"
              :name="item.id"
              :maxlength="item.maxLength"
              :placeholder="item.placeholder"
              v-model="item.value"
              required
            />
            <textarea v-else class="py-1 px-2 mx-auto shadow-inner text-lg rounded-lg bg-gray-100 dark:bg-gray-300 text-gray-800 placeholder:font-thin placeholder:dark:text-gray-500 caret-gray-800 outline-none focus:shadow-inner"
              :id="item.id" :maxlength="item.maxLength" rows=2
              :placeholder="item.placeholder"
              v-model="item.value"
              required
            />
            <span class="text-xs px-1 text-gray-400 block">{{ item?.help }} </span>
          </div>
          <p class="absolute w-full text-center -top-3.5 left-1/2 -translate-x-1/2 text-red-700 text-xs" v-if="error" v-html="error"/>
        </form>
      </template>
    </detail-card>
  </div>
</template>

<script>
import DetailCard from './UI/Card/DetailCard.vue';

export default {
  components: {DetailCard},
  name: 'TheContacts',
  data () {
    return {
      formVisible: false,
      isLoading: false,
      data: null,
      error: null,
      formItems: [
        {
          id: "first_name",
          type: "text",
          label: "First name",
          placeholder: "Jane",
          maxLength: 50,
          value: ""
        },
        {
          id: "last_name",
          type: "text",
          label: "Last name",
          placeholder: "Doe",
          maxLength: 50,
          value: ""
        },
        {
          id: "email",
          type: "email",
          label: "Email",
          placeholder: "jane.doe@mail.com",
          maxLength: 100,
          value: ""
        },
        {
          id: "content",
          type: "textarea",
          label: "Message",
          placeholder: "Here goes my message",
          help: "Please keep it within 280 characters",
          maxLength: 280,
          value: ""
        },
      ]
    }
  },
  watch: {
  },
  props: [
    "observer",
  ],
  inject: [
    'loadData'
  ],
  computed: {
    canSubmit () {
      return this.formItems.every(
        item => {
          return item.value
        }
      )
    },
  },
  methods: {
    closeForm () {
      this.formVisible = false;
    },
    openForm () {
      this.formVisible = true;
    },
    submitMessage () {
      if (!this.canSubmit) {
        return
      }
      this.isLoading = true;
      let url = process.env.VUE_APP_BACKEND_URL + "/api/contacts/";
      let data = {};
      this.formItems.forEach(
        item => {
          data[item.id] = item.value
        }
      );
      return fetch(url, {
        method:"POST",
        headers:{"Content-Type": "application/json", "X-CSRFToken": this.data.token},
        body: JSON.stringify(data)
      }).then(
        response => {
          this.isLoading = false;
          if (response.ok) {
            this.$refs.formCard.close();
          } else {
            if (response.status == 400) {
              this.error = "Invalid data, please review your inputs and try again."
              this.formItems.find(item => item.id == 'email').value = "";
            } else if (response.status == 500) {
              this.error = "There was a problem processing your request, please try again later"
            }
          }
        }
      ).catch(
        error => {
          this.isLoading = false;
          this.error = "Something went wrong when submitting.";
          console.log(error);
        }
      )
    },
  },
  beforeUnmount () {
  },
  mounted () {
    this.observer.observe(this.$el);
    this.loadData('/api/contacts/get-token/', this);

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
a {
  @apply bg-white dark:bg-gray-400 p-3 m-auto  shadow-md rounded-xl 
}

</style>
