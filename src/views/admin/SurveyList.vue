<template>
  <div class="app-container">
    <el-container>
      <el-header>
        <span class="logo-name">简橙</span>
        <span> ———简洁免费的调查问卷系统</span>
      </el-header>

      <el-main>
        <el-row :gutter="4">
          <!-- 问卷列表及管理 -->
          <el-col :span="9">
            <!-- 搜索功能 -->
            <el-card class="box-card">
              <el-form :model="queryParams" size="small" :inline="true">
                <el-form-item label="标题" prop="roleName">
                  <el-input v-model="queryParams.title" placeholder="请输入标题" clearable style="width: 240px"
                    @keyup.enter="handleQuery" />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" :icon="Search" @click="handleQuery">搜索</el-button>
                  <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
                </el-form-item>
              </el-form>
              <!-- 新建、开始收集、停止收集、复杂链接、上传问卷功能按钮 -->
              <el-row :gutter="5" class="mb8">
                <el-col :span="1.5">
                  <el-button type="primary" plain size="small" :icon="Plus" @click="handleAdd">新建问卷</el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button type="success" plain size="small" :icon="VideoPlay" :disabled="selectedRows.length === 0"
                    @click="handleStartCollect">开始收集
                  </el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button type="danger" plain size="small" :disabled="selectedRows.length === 0" :icon="VideoPause"
                    @click="handleStopCollect">停止收集
                  </el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button type="success" plain size="small" :disabled="selectedRows.length !== 1" :icon="Link"
                    @click="copySurveyLink">复制链接
                  </el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-upload :on-success="handleUploadSuccess" :on-error="handleUploadFail" accept=".xlsx"
                    :show-file-list="false" action="/api/admin/survey/import">
                    <el-button color="#555555" size="small" :icon="UploadFilled" plain>上传问卷</el-button>
                  </el-upload>
                </el-col>
              </el-row>
              <!-- 问卷列表 -->
              <el-table v-loading="loading"  border fit :highlight-current-row="true" :data="surveyList" @row-click="handleClickRow"
                @selection-change="handleSelectionChange">
                <el-table-column type="selection" align="center">
                </el-table-column>
                <el-table-column width="70" label="序号" type="index" align="center">
                </el-table-column>
                <el-table-column prop="title" align="center" label="标题">
                </el-table-column>
                <el-table-column prop="status" align="center" key="title" label="状态" :show-overflow-tooltip="false">
                  <template #default="{ row }">
                    <el-tag v-if="row.status === 'new'">初始</el-tag>
                    <el-tag type="success" v-if="row.status === 'collecting'">收集中</el-tag>
                    <el-tag type="danger" v-if="row.status === 'stop'">停止</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="150">
                  <template #default="{ row }">
                    <el-popconfirm confirm-button-text="确定" cancel-button-text="取消" @confirm="handleDelete(row)"
                      title="确定要删除吗?">
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
            </el-card>
          </el-col>
          <!-- 标签页 -->
          <el-col :span="15">
            <el-tabs v-model="activeName" type="border-card" @tab-click="handleTabClick">
              <el-tab-pane name="first" label="题目管理">
                <QuestionList v-if="openDetails[0]" :surveyId="surveyId" />
              </el-tab-pane>
              <el-tab-pane name="second" label="问卷分析">
                <Analysis v-if="openDetails[1]" :surveyId="surveyId"></Analysis>
              </el-tab-pane>
              <el-tab-pane name="third" label="问卷设置">
                <AddSurvey v-model:needRefresh="needRefresh"  v-if="openDetails[2]" :isDetail="isDetail" :form="form"></AddSurvey>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>

</template>
<script setup>
import { watch, nextTick, onMounted, reactive, ref, toRefs } from 'vue'
import { list, add, del, update, get } from "@/api/admin/survey.js";
import QuestionList from "./QuestionList.vue";
import Analysis from "@/views/admin/Analysis.vue";
import AddSurvey from "@/views/admin/AddSurvey.vue"
import {
  Delete,
  Plus,
  Search,
  Refresh,
  Link,
  UploadFilled,
  VideoPlay,
  VideoPause
} from "@element-plus/icons";
import useClipboard from 'vue-clipboard3';
import { tabBarProps } from 'element-plus';

const loading = ref(true)
// 已选择的问卷
const { toClipboard } = useClipboard();
const isDetail = ref('新 增')
const surveyId = ref('')
const openDetails = ref([false,false,false])
const activeName = ref('third')
// 存储问卷列表
const surveyList = ref([])
// 问卷总数
const total = ref(0)
// 已选择的问卷
const selectedRows = ref([])

// 新增问卷之后需要刷新
const needRefresh = ref(false)
const data = reactive({
  form: {
    options: []
  },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: '',
  },
});
const { queryParams, form } = toRefs(data);

watch(needRefresh, (newValue, oldValue) => {
// 需要刷新
  if (newValue) {
    getList()
  }

});
// 初始化获取列表
onMounted(() => {
  getList()
})

// 查询问卷的函数
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
// 重置函数
function resetQuery() {
  queryParams.value.title = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  getList();
}
// 获取问卷列表
function getList() {
  list(queryParams.value).then(res => {
    if (res.success) {
      surveyList.value = res.data.list
      total.value = res.data.total
    } else {
      ElMessage.error(res.message)
    }
  })
  loading.value = false
}

// 新建问卷
function handleAdd() {
  openDetails.value[2] = true
  activeName.value = 'third'
  isDetail.value = "新 增"


}

// 开始收集的函数
function handleStartCollect() {
  selectedRows.value.forEach(row => {
    row.status = 'collecting'
    update(row).then(res => {
      if (res.success) {
        ElMessage.success(row.title + '发布成功！');
        getList()
      } else {
        ElMessage.error(row.title + '发布失败！');
      }

    })
  })
}

// 停止收集的函数
function handleStopCollect() {
  selectedRows.value.forEach(row => {
    row.status = 'stop'
    update(row).then(res => {
      if (res.success) {
        ElMessage.success(row.title + '停止成功！');
        getList()
      } else {
        ElMessage.error(row.title + '停止失败！');
      }

    })
  })

}
// 复杂链接的函数
function copySurveyLink() {
  try {
    //获取url
    let url = 'http://' + window.location.host + '/survey/' + selectedRows.value[0].id
    toClipboard(url)
    ElMessage.success('复制成功！');
  } catch (e) {
    ElMessage.error('复制失败！');
  }
}
// 上传问卷成功的回调的函数
function handleUploadSuccess(response) {
  if (response.success) {
    ElMessage.success('上传成功！');
    getList()
  } else {
    ElMessage.error('上传失败！');
  }
}
// 上传问卷成功的回调的函数
function handleUploadFail() {
  ElMessage.error('上传失败！')
}
// 处理问卷表格点击的操作
function handleClickRow(row) {

 
  isDetail.value = '详 情'
  // 第三个可见
  if(activeName.value === "first"){
    openDetails.value[0] = true
  }else if(activeName.value === "second"){
    openDetails.value[1] = true
  }
  openDetails.value[2] = true
  surveyId.value = row.id
  nextTick(() => {
    
    form.value = row
  })
}

// 处理问卷选这改变时候的操作
function handleSelectionChange(val) {
  selectedRows.value = val
}

// 处理删除问卷操作
function handleDelete(row) {
  del(row.id).then(res => {
    if (res.success) {
      ElMessage.success('删除成功！');
      getList()
    } else {
      ElMessage.error('删除失败！');
    }

  })
}
// 分页器-页面大小变化
function handleSizeChange(val) {
  queryParams.value.pageSize = val
  getList()
}
// 分页器-页面变化
function handleCurrentChange(val) {
  queryParams.value.pageNum = val
  getList()
}
// 处理标签页点击的函数
function handleTabClick(TabsPaneContext,event){
  if(TabsPaneContext.props.name === "first" && surveyId.value){
    openDetails.value[0] = true
  }else if(TabsPaneContext.props.name === "second" && surveyId.value){
    openDetails.value[1] = true
  }else if(surveyId.value){
    openDetails.value[2] = true
  }

}

</script>

<style scoped>
.app-container {
  padding: 10px;
}

.el-header {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 10px;
  background-color: #f8f8f9;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
  margin-bottom: 0px;
}

.logo-name {
  font-size: 25px;
  color: #ebb22e;
  -webkit-text-stroke-width: 0.5px;
  -webkit-text-stroke-color: #181818;
}

.mb8 {
  margin-bottom: 8px;
}
</style>
