<template>
  <el-button type="primary" :icon="Plus" @click="handleAdd" style="margin-bottom: 10px;">新增题目</el-button>
  <el-table border fit :highlight-current-row="true" :data="questionList">
    <el-table-column width="70" label="序号" type="index" align="center">
    </el-table-column>
    <el-table-column prop="text" align="left" key="text" label="题目" :show-overflow-tooltip="true">
      <template #default="{ row }">
        <!-- 题目类型 -->
        <el-tag v-if="row.type === 'radio'">单选</el-tag>
        <el-tag type="warning" v-if="row.type === 'checkbox'">多选</el-tag>
        <el-tag type="success" v-if="row.type === 'text'">简答</el-tag>
        <span>{{ row.text }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="options" align="left" key="options" label="选项">
      <!-- 如果是选择题就循环遍历显示 -->
      <template #default="{ row }">
        <span v-if="row.type !== 'text'">
          <span v-for="(option, index) in row.options" :key="option.key">
            <span v-if="index !== 0">,</span>
            <span>{{ option.value }}</span>
          </span>
        </span>
      </template>
    </el-table-column>
    <el-table-column label="排序" width="70" align="center" key="order" prop="order" :show-overflow-tooltip="true" />
    <el-table-column label="操作" align="center" width="150">
      <template #default="{ row }">
        <el-button link type="primary" @click="handleEdit(row)" :icon="Edit">修改</el-button>
        <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)" title="确定要删除吗?">
          <template #reference>
            <el-button link type="danger" :icon="Delete">删除</el-button>
          </template>
        </el-popconfirm>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页器 -->
  <el-pagination style="padding-top: 20px" small :style="{ 'justify-content': 'center' }" :background="true"
    :hide-on-single-page="false" :current-page="queryParams.pageNum" :page-size="queryParams.pageSize"
    :page-sizes="[5, 10, 30, 50]" :total="total" layout=" sizes, prev, pager, next"
    @current-change="handleCurrentChange" @size-change="handleSizeChange" />
</template>
<script setup>
import {computed, onMounted, reactive, ref, toRefs, watch} from 'vue'
import {list, add, del, update, get} from "@/api/admin/question.js";
import {Delete, Edit, Plus} from "@element-plus/icons";
const props = defineProps({
  surveyId: String,
})
// 存放题目数组信息
const questionList = ref([])
const total = ref(0)
const data = reactive({
  form: {
    options: []
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    survey_id: props.surveyId
  },
});

const {queryParams, form} = toRefs(data);
watch(() => props.surveyId, (oldValue,newValue) => {
  queryParams.value.survey_id= newValue
  getList()
});

onMounted(() => {
  getList()
});

function getList() {
  list(queryParams.value).then(res => {
    questionList.value = res.data.list
    total.value = res.data.total
  })
}
// 新增题目
function handleAdd() {
  // TODO
}

// 编辑题目
function handleEdit(row) {
  // TODO
}
// 删除题目
function handleDelete(row) {
  // TODO
}
// 分页器-页面变化
function handleCurrentChange(row) {
  // TODO
}
// 分页器-页面大小变化
function handleSizeChange(row) {
  // TODO
}


</script>

<style scoped></style>
