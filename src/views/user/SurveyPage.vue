<template>
  <h1>问卷填写页面</h1>

</template>
<script setup>
import { onMounted, reactive, ref } from "vue";
import { get } from "@/api/user/survey.js";
import { list } from "@/api/user/question.js";
import { add } from "@/api/user/answer.js";
import { useRoute } from "vue-router";
import Fingerprint2 from 'fingerprintjs2';

// 是否显示提交对话框
const confirmDialogVisible = ref(false)
// 是否显示问卷
const disabled = ref(false)
// 允许提交
const allowSubmit = ref(true)
const route = useRoute()
const surveyId = route.params.id
const finger = ref('')
const survey = reactive({
  title: '',
  description: '',
  need_contact: '',
  water_mark: [],
  questions: [],
})
 
const formRef = ref()

// 表单数据
const form = reactive({
  contact: undefined,
  answers: {},
})

// 校验规则
const rules = ({
  contact: [{ required: true, message: '请填写联系方式', trigger: 'blur' }],
})
// 初始化 校验并且获取指纹
onMounted(() => {
  initSurvey();
  getFinger();
});

// 对问卷进行校验，是否可以填写
async function initSurvey() {
  const surveyData = await get(surveyId);
  const datetime = new Date();
  if (datetime < new Date(surveyData.data.start_time) || datetime > new Date(surveyData.data.end_time)) {
    ElNotification({
      title: '抱歉',
      message: '当前问卷不在答题时间内!',
      type: 'warning',
    })
    allowSubmit.value = false
    return
  }
  survey.title = surveyData.data.title;
  survey.description = surveyData.data.description;
  survey.need_contact = surveyData.data.need_contact;
  survey.contact_type = surveyData.data.contact_type;
  survey.water_mark = surveyData.data.water_mark.split('\n');
  survey.questions = (await list({ pageNum: 1, pageSize: 99999, survey_id: surveyId })).data.list;
  survey.questions.forEach((q) => {
    rules[`answers.${q.id}`] = [{ required: true, message: "请填写", trigger: q.type === 'text' ? "blur" : "change" }];
  });
}

// 获取浏览器指纹
function getFinger() {
  Fingerprint2.get((components) => {
    // components数组包含了浏览器指纹的各个组成部分
    const values = components.map((component) => component.value);
    finger.value = Fingerprint2.x64hash128(values.join(''), 31);
  });
}

</script>

<style scoped></style>
