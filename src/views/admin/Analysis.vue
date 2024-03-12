<template>
  <div class="analysis-container">
    <el-tag>题目数量 : {{ analysisSurveyData.QuestionCount }}</el-tag>
    <el-tag>答题次数 : {{ analysisSurveyData.KeyCount }}</el-tag>
    <el-tag>统计的浏览器数量 : {{ analysisSurveyData.FingerCount }}</el-tag>
    <el-tag>统计的联系方式数量 : {{ analysisSurveyData.ContactCount }}</el-tag>
    <el-tag>第一次答题时间 : {{ analysisSurveyData.MinCreateAt }}</el-tag>
    <el-tag>最后一次答题时间 : {{ analysisSurveyData.MaxCreateAt }}</el-tag>
  </div>
  <!--题目答案详情 -->
  <el-table v-loading="loading" border :data="questionList" @expand-change="ExpandChange">
    <el-table-column type="expand">
      <template #default="{ row }">
        <div style="padding-left: 10px">
          <!-- 如果不是简答题遍历显示选项 -->
          <div v-if="row.type !== 'text'">
            <el-tag v-for="op in row.options">{{ op.label }} : {{ op.value }}</el-tag>
          </div>
          <!-- 显示浏览器、联系方式的情况 -->
          <div v-if="questionAnalysisResults[row.id]" style="padding: 2px"
            v-for="result in questionAnalysisResults[row.id].split('###')">
            <span>{{ result }}</span>
          </div>
          <!-- 答案详情按钮 -->
          <div style="padding: 4px">
            <el-button size="small" type="info" plain @click="handleAnswerDetails(row.type, row.id)">查看答案详情
            </el-button>
          </div>

        </div>
      </template>
    </el-table-column>
    <el-table-column label="题目" align="left" key="text" prop="text" :show-overflow-tooltip="true">
      <template #default="{ row }">
        <el-tag v-if="row.type === 'radio'">单选</el-tag>
        <el-tag type="warning" v-if="row.type === 'checkbox'">多选</el-tag>
        <el-tag type="success" v-if="row.type === 'text'">简答</el-tag>
        <span>{{ row.text }}</span>
      </template>
    </el-table-column>
  </el-table>

  <!-- 分页器 -->
  <el-pagination style="padding-top: 20px" small :style="{ 'justify-content': 'center' }" :background="true"
    :hide-on-single-page="false" :current-page="queryParams.pageNum" :page-size="queryParams.pageSize"
    :page-sizes="[5, 10, 30, 50]" :total="total" layout=" sizes, prev, pager, next"
    @current-change="handleCurrentChange" @size-change="handleSizeChange" />
  <!-- 查看答案详情 -->
  <el-dialog title="答案详情" v-model="showDetails" width="70%" append-to-body>
    <AnswerDetails :question-type="currType" :question-id="currQuestionId"></AnswerDetails>
  </el-dialog>


</template>
<script setup>
import { analysis as SurveyAnalysis } from "@/api/admin/survey.js";
import { list as listQuestion, analysis as QuestionAnalysis } from "@/api/admin/question.js";

import AnswerDetails from "@/views/admin/AnswerDetails.vue";
import { nextTick, onMounted, reactive, ref, watch } from "vue";
const props = defineProps({
  surveyId: String,
})
const loading =ref(true)
// 题目总数
const total = ref(0)
// 问题列表
const questionList = ref([])
// 题目的分析结构列表
const questionAnalysisResults = ref({})
// 是否展开答案详情
const showDetails = ref(false)
// 当前题目类型
const currType = ref('')
// 当前题目ID
const currQuestionId = ref(0)

const analysisSurveyData = ref({
  KeyCount: 0,
  ContactCount: 0,
  FingerCount: 0,
  MaxCreateAt: '',
  MinCreateAt: '',
  QuestionCount: 0,
});
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  survey_id: props.surveyId
});

// 监听选择问卷的ID变化
watch(() => props.surveyId, (newValue,oldValue) => { 
  if (newValue) {
    queryParams.survey_id = newValue
    nextTick(() => {
      getSurveyAnalysis()

    })
    
  }
});

onMounted(() => {
  getSurveyAnalysis()
})
//  获取问卷答题详情
function getSurveyAnalysis() {
  SurveyAnalysis(props.surveyId).then(res => {
    if (res.success) {
      analysisSurveyData.value = res.data
    } else {
      ElMessage.error(res.message)
    }
  })
  ListQuestion()
  loading.value = false
}

// 表格展开的时候处理
function ExpandChange(row, expandedRows) {
  //expandedRows是一个数组，里面包含了所有展开的行的数据,要过滤expandedRows，只保留当前行的数据
  expandedRows = expandedRows.filter(item => item.id === row.id)
  if (expandedRows.length > 0) {
    currQuestionId.value = row.id
    getQuestionAnalysis(row.id)
  }

}
// 查询问题列表
function ListQuestion() {
  listQuestion(queryParams).then(res => {
    if (res.success) {
      ElMessage.success(res.message)
      questionList.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.message)
    }
  })
}
//某个题目的答题详情
function getQuestionAnalysis(question_id) {
  QuestionAnalysis(question_id).then(res => {
    if (res.success) {
      const data = res.data
      const result = "共有 " + data.finger_count + " 个浏览器参与了本题调查,共留下 " + data.contact_count + " 个联系方式! ###";
      let result2 = "";
      const count = data.count
      for (const item in data.label_info) {
        if (item === "") break
        const tCount = data.label_info[item]
        const rate = tCount / count * 100
        result2 += "  选项 " + item + " 被选择了 " + tCount + " 次,占比为 " + rate.toFixed(2) + " %###";
      }
      questionAnalysisResults.value[question_id] = result + result2 + "点击按钮查看答案详情"
    } else {
      ElMessage.error(res.message)
    }
  })
}
// 答案详情的处理
function handleAnswerDetails(type, qid) {
  currType.value = type
  currQuestionId.value = 0
  currQuestionId.value = qid
  showDetails.value = true
}
// 分页器页面大小改变
function handleSizeChange(val) {
  queryParams.pageSize = val
  ListQuestion()
}
// 分页器页面 改变
function handleCurrentChange(val) {
  queryParams.pageNum = val
  ListQuestion()
}
</script>

<style scoped>
.analysis-container {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 20px;
}

.el-tag {
  margin-bottom: 8px;
  margin-right: 8px;
}
</style>
