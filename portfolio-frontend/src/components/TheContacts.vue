<template>
  <section
    class="container min-h-[50vh] relative flex w-screen mx-auto flex-wrap my-[20vh] text-ink dark:text-white"
    ref="root"
  >
    <div class="container flex flex-wrap mx-auto my-10 px-5">
      <h2
        class="text-center mt-auto text-xl w-full font-bold mx-auto text-ink dark:text-white"
      >
        Get in touch!
      </h2>
      <button
        type="button"
        class="mx-auto mb-auto mt-4 rounded-full bg-teal px-6 py-3 text-center font-semibold text-white shadow-md ring-1 ring-teal/20 transition duration-300 hover:-translate-y-0.5 hover:bg-teal/90 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-tealSoft dark:bg-tealSoft dark:text-night dark:ring-tealSoft/30 dark:hover:bg-tealSoft/90"
        @click="formVisible = true"
      >
        Click here to send me a message.
      </button>
    </div>
    <detail-card
      ref="formCard"
      :is-open="formVisible"
      @card-closed="formVisible = false"
    >
      <template #title>
        <p>Contact form</p>
      </template>
      <template #subtitle>
        <p>Send me a quick message!</p>
      </template>
      <template #extra-title-content>
        <button
          v-if="!isLoading"
          class="absolute right-4 top-4 rounded-full px-5 py-2 text-sm font-semibold shadow-sm ring-1 transition duration-300 focus:outline-none focus:ring-2 focus:ring-tealSoft"
          :class="{
            'bg-teal text-white ring-teal/20 hover:-translate-y-0.5 hover:bg-teal/90 hover:shadow-lg dark:bg-tealSoft dark:text-night dark:ring-tealSoft/30 dark:hover:bg-tealSoft/90': canSubmit,
            'cursor-not-allowed bg-muted/20 text-muted ring-ink/10 dark:bg-white/10 dark:text-gray-400 dark:ring-white/10': !canSubmit,
          }"
          type="submit"
          :disabled="!canSubmit"
          @click.prevent="submitMessage"
        >
          Send
        </button>
        <div
          v-else
          class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-md ring-1 ring-ink/10 dark:bg-nightSurface dark:ring-white/10"
        >
          <svg
            role="status"
            class="h-6 w-6 animate-spin text-tealSoft fill-teal dark:text-teal/30 dark:fill-tealSoft"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      </template>
      <template #inner-content>
        <form
          class="relative mx-auto grid max-w-lg grid-cols-1 gap-4 px-4 sm:grid-cols-2"
          autocomplete="on"
        >
          <div
            v-for="(item, idx) in formItems"
            :key="item.id"
            class="w-full"
          >
            <label
              class="mb-1 ml-1 block text-sm font-semibold text-ink dark:text-white"
              :for="item.id"
              >{{ item.label }}</label
            >
            <input
              v-if="item.type != 'textarea'"
              :id="item.id"
              v-model="item.value"
              class="w-full rounded-xl bg-sand/70 px-3 py-2 text-base text-ink caret-teal ring-1 ring-ink/10 outline-none transition placeholder:font-light placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-teal dark:bg-nightElevated dark:text-white dark:caret-tealSoft dark:ring-white/10 dark:placeholder:text-gray-400 dark:focus:bg-nightSurface dark:focus:ring-tealSoft"
              :class="{
                'invalid:ring-red-500 invalid:focus:ring-red-500': item.value,
              }"
              :type="item.type"
              :name="item.id"
              :maxlength="item.maxLength"
              :placeholder="item.placeholder"
              :autofocus="idx == 0"
              :autocomplete="item.autocomplete ? 'on' : 'off'"
              required
            />
            <textarea
              v-else
              :id="item.id"
              v-model="item.value"
              class="w-full rounded-xl bg-sand/70 px-3 py-2 text-base text-ink caret-teal ring-1 ring-ink/10 outline-none transition placeholder:font-light placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-teal dark:bg-nightElevated dark:text-white dark:caret-tealSoft dark:ring-white/10 dark:placeholder:text-gray-400 dark:focus:bg-nightSurface dark:focus:ring-tealSoft sm:col-span-2"
              :maxlength="item.maxLength"
              rows="3"
              :placeholder="item.placeholder"
              :autocomplete="item.autocomplete ? 'on' : 'off'"
              required
            />
            <span class="block px-1 pt-1 text-xs text-muted dark:text-gray-400"
              >{{ item?.help }}
            </span>
          </div>
          <p
            v-if="error"
            class="absolute -top-4 left-1/2 w-full -translate-x-1/2 text-center text-xs text-red-700 dark:text-red-300"
            v-html="error"
          />
        </form>
      </template>
    </detail-card>
  </section>
</template>

<script setup lang="ts">
import { Ref, computed, ref } from "vue";
import DetailCard from "./UI/Card/DetailCard.vue";
import backendService from "@/services/api.service";
import { ContactForm } from "@/models/models.interface";
import { useVisibilityObserver } from "@/composables/visibilityObserver";

const root: Ref<HTMLDivElement | null> = ref(null);

useVisibilityObserver("theContacts", root);

type FormItem = {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  maxLength: number;
  value: string;
  help?: string;
  autocomplete?: boolean;
};

const formVisible = ref(false);
const isLoading = ref(false);
const error = ref(null);
const formItems: Ref<FormItem[]> = ref([
  {
    id: "first_name",
    type: "text",
    label: "First name",
    placeholder: "Jane",
    maxLength: 50,
    value: "",
    autocomplete: true,
  },
  {
    id: "last_name",
    type: "text",
    label: "Last name",
    placeholder: "Doe",
    maxLength: 50,
    value: "",
    autocomplete: true,
  },
  {
    id: "email",
    type: "email",
    label: "Email",
    placeholder: "jane.doe@mail.com",
    maxLength: 100,
    value: "",
    autocomplete: true,
  },
  {
    id: "content",
    type: "textarea",
    label: "Message",
    placeholder: "Here goes my message",
    help: "Please keep it within 280 characters",
    maxLength: 280,
    value: "",
    autocomplete: false,
  },
]);

const canSubmit = computed(() => {
  return formItems.value.every((item: FormItem) => {
    return item.value;
  });
});

function createFormPayload() {
  return formItems.value.reduce<ContactForm>(
    (acc, obj) => {
      return { ...acc, [obj.id]: obj.value };
    },
    { first_name: "", last_name: "", email: "", content: "" }
  );
}

async function submitMessage() {
  if (canSubmit.value) {
    isLoading.value = true;
    backendService.postContactForm(createFormPayload()).then(() => {
      isLoading.value = false;
      formItems.value.forEach((item) => {
        item.value = "";
      });
      DetailCard.close();
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>