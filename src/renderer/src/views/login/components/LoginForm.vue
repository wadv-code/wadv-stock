<script setup lang="ts">
import { GetUserInfo, PostPhoneLogin } from '@renderer/api/login';
import SmsCodeButton from '@renderer/components/login/SmsCodeButton.vue';
import { ThemeDark } from '@renderer/components/theme';
import { Button } from '@renderer/components/ui/button';
import { Card, CardContent } from '@renderer/components/ui/card';
import { Input } from '@renderer/components/ui/input';
import { Label } from '@renderer/components/ui/label';
import { token, userInfo } from '@renderer/core/storage';
import { $t } from '@renderer/locales';
import { MoonStar, Sun } from 'lucide-vue-next';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toast } from 'vue-sonner';

const route = useRoute();
const router = useRouter();

const loading = ref(false);
const params = reactive({
  phone: '',
  code: ''
});

const handleToast = () => {
  toast.success($t('tips.toast'), {
    description: `${userInfo.value.name || userInfo.value.name} - ${$t('tips.success')}`,
    action: {
      label: $t('common.close'),
      onClick: () => console.log($t('common.close'))
    },
    position: 'top-center'
  });
};

const goRedirect = () => {
  const redirect = route.query.redirect as string | undefined;
  router.push({
    path: redirect ?? '/',
    query: { ...route.query, redirect: undefined }
  });
};

const onSubmit = async () => {
  try {
    loading.value = true;
    const { data } = await PostPhoneLogin(params);
    token.value = data.token;
    await getUserInfo();
    handleToast();
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false;
  }
};

const getUserInfo = async () => {
  try {
    const { data } = await GetUserInfo();
    userInfo.value = data.user;
    token.value = data.token;
    goRedirect();
  } catch (error) {
    console.log(error);
  }
};

onMounted(() => {
  // GetUserInfo()
  //   .then((res) => {
  //     console.log(res);
  //   })
  //   .catch((err) => {
  //     console.log('err', err);
  //   });
  getUserInfo();
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card class="overflow-hidden">
      <CardContent class="grid p-0 md:grid-cols-2">
        <div class="p-6 md:p-8 flex flex-col gap-6">
          <form @submit.prevent="onSubmit">
            <div class="flex flex-col gap-6">
              <div class="flex flex-col items-center text-center">
                <h1 class="text-2xl font-bold">
                  {{ $t('page.login.welcome') }}
                </h1>
                <p class="text-balance text-muted-foreground mt-2">
                  {{ $t('page.login.tips') }}
                </p>
              </div>
              <div class="grid gap-2">
                <Label for="phone">{{ $t('common.phone') }}</Label>
                <Input
                  v-model="params.phone"
                  id="phone"
                  type="text"
                  :placeholder="$t('common.phone')"
                  required
                />
              </div>
              <div class="grid gap-2">
                <!-- <div class="flex items-center">
                <Label for="password">Password</Label>
                <a href="#" class="ml-auto text-sm underline-offset-2 hover:underline">
                  Forgot your password?
                </a>
              </div> -->
                <Label for="code">{{ $t('common.password') }}</Label>
                <div class="flex items-center">
                  <Input
                    v-model="params.code"
                    id="code"
                    type="text"
                    :placeholder="$t('common.code')"
                    required
                  />
                  <SmsCodeButton :phone="params.phone" class="ml-2">
                    {{ $t('common.smsCode') }}
                  </SmsCodeButton>
                </div>
              </div>
              <Button type="submit" :loading="loading" class="w-full">
                {{ $t('common.login') }}
              </Button>
            </div>
          </form>
          <!-- <div
            class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
          >
            <span class="relative z-10 bg-background px-2 text-muted-foreground">
              {{ $t('tips.with') }}
            </span>
          </div> -->
          <div class="grid grid-cols-3 gap-4">
            <!-- <Button variant="outline" class="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                  fill="currentColor"
                />
              </svg>
              <span class="sr-only">Login with Apple</span>
            </Button>
            <Button variant="outline" class="w-full">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              <span class="sr-only">Login with Google</span>
            </Button> -->
            <ThemeDark #="{ dark, toggle }">
              <Button variant="outline" class="w-full" @click="toggle">
                <component :is="dark ? MoonStar : Sun" />
              </Button>
            </ThemeDark>
          </div>
          <!-- <div class="text-center text-sm">
            {{ $t('tips.have') }}
            <a href="/#/error" class="underline underline-offset-4">
              {{ $t('common.signUp') }}
            </a>
          </div> -->
        </div>
        <div class="flex items-center justify-center">
          <img
            src="@renderer/assets//svg/login-logo.svg"
            alt="Image"
            class="inset-0 h-auto w-60 md:w-85 object-cover dark:brightness-[0.7] dark:grayscale"
          />
        </div>
      </CardContent>
    </Card>
    <div
      class="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary"
    >
      {{ $t('tips.agree') }}
      <!-- By clicking continue, you agree to our <a href="#">Terms of Service</a>
      and <a href="#">Privacy Policy</a>. -->
    </div>
  </div>
</template>
