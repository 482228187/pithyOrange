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
    <!--新增题目的对话框 -->
    <el-dialog :title="title" v-model="open" :width="dialogWidth" append-to-body>
      <el-form ref="questionRef" :model="form" :rules="rules" label-width="20%">
        <el-row :gutter="10">
          <el-col :span="24">
            <el-form-item label="问卷ID" prop="surveyId">
              <el-input disabled v-model="form.survey_id" placeholder="请输入标题"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="题目内容" prop="text">
              <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 5 }" v-model="form.text"
                        placeholder="请输入题目内容"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="题目类型" prop="type">
              <el-select v-model="form.type" placeholder="请选择题目类型">
                <el-option label="单选" value="radio"></el-option>
                <el-option label="多选" value="checkbox"></el-option>
                <el-option label="简答" value="text"></el-option>
              </el-select>
              <el-divider v-if="form.type !== 'text'" direction="vertical"/>
              <el-button v-if="form.type !== 'text'" type="success" @click="addOption">新增选项</el-button>
            </el-form-item>
          </el-col>
          <!-- 不是简答题则添加选项 -->
          <el-col :span="24">
            <el-form-item v-if="form.type !== 'text'"
                          v-for="(option, index) in form.options"
                          :label="'选项 ' + String.fromCharCode(65 + index)"
                          :key="option.key"
                          :prop="'options.' + index + '.value'">
              <!-- 让元素的子元素直接显示在文档树中，替代了该元素自身的布局。将元素的内容垂直居中对齐。 -->
              <div style="display: contents;vertical-align: middle;">
                <div style="padding: 3px;width: 60%">
                  <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 5 }"
                            v-model="form.options[index].value"></el-input>
                </div>
                <div style="padding: 3px">
                  <el-checkbox  v-model="form.options[index].has_ext_msg" true-label="yes" false-label="no"
                               label="填写备注"/>
                </div>
                <div style="padding: 3px">
                  <el-button type="danger" @click.prevent="removeOption(option)">删除</el-button>
                </div>
              </div>
            </el-form-item>
          </el-col>
          <!-- 排序 -->
          <el-col :span="24">
            <el-form-item label="排序" prop="order">
              <el-input-number v-model="form.order" placeholder="请输入排序"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>


      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm(questionRef)">确 定</el-button>
          <el-button @click="open = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

</template>
<script setup>
import {computed, onMounted, reactive, ref, toRefs, watch} from 'vue'
import {list, add, del, update, get} from "@/api/admin/question.js";
import {Delete, Edit, Plus} from "@element-plus/icons";
const props = defineProps({
  surveyId: String,
})
const open = ref(false)
const title = ref('')
// 对话框表单对象
const questionRef = ref()
// 对话框宽度
const dialogWidth = computed(() => {
  return window.innerWidth > 768 ? '60%' : '95%'
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
// 对话框的表单校验规则
const rules = ({
  text: [{required: true, message: '请输入题目内容', trigger: 'blur'}],
  type: [{required: true, message: '请选择题目类型', trigger: 'change'}],
  order: [{required: true, message: '请输入排序', trigger: 'blur'}],
})
watch(() => props.surveyId, (oldValue,newValue) => {
  queryParams.value.survey_id= newValue
  
  console.log("变化的新ID+"+newValue)
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
  reset();
  open.value = true
  title.value = '新增'
}
function reset() {
  form.value = {
    survey_id: props.surveyId,
    text: '',
    type: 'radio',
    options: [],
    order: total.value + 1, // 默认排序为当前题目数量+1
  }
}


// 编辑题目
function handleEdit(row) {
  reset();
  get(row.id).then(res => {
    form.value = res.data
    open.value = true
    title.value = '修改'
    //添加校验项
    for (let i = 0; i < form.value.options.length; i++) {
      rules['options.' + i + '.value'] = [{required: true, message: '不能为空', trigger: 'blur'}]
    }
  })
}
// 删除题目
function handleDelete(row) {
  del(row.id).then(res => {
    if (res.success) {
      ElMessage.success(res.message)
      getList()
    } else {
      ElMessage.error(res.message)
    }
  })
}
// 分页器-页面变化
function handleCurrentChange(val) {
  queryParams.value.pageNum = val
  getList()
}
// 分页器-页面大小变化
function handleSizeChange(val) {
  queryParams.value.pageSize = val
  getList()
}
// 新增选项
function addOption() {
  form.value.options.push({
        label: String.fromCharCode(65 + form.value.options.length), // A B C D
        value: '', // 选项的值
        key: Date.now() // 选项的唯一标识
      }
  )
  //添加校验项
  const index = form.value.options.length - 1
  rules['options.' + index + '.value'] = [{required: true, message: '不能为空', trigger: 'blur'}]
}
// 删除选项
function removeOption(op) {
  const index = form.value.options.indexOf(op);
  if (index !== -1) {
    // 删除选项
    form.value.options.splice(index, 1)
    // 重新设置label A B C D
    form.value.options.forEach((item, index) => {
      item.label = String.fromCharCode(65 + index)
    })
  }
}
// 新增题目对话框的提交按钮
function submitForm(elForm) {
  elForm.validate((valid, fields) => {
    if (valid) {
      // 如果不是简答题则需要添加选项
      if(form.value.type!=='text' && form.value.options.length===0){
        ElMessage.error('请添加选项')
        return
      }
      // 如果是修改则更新数据
      if (form.value.id) {
        update(form.value).then(res => {
          if (res.success) {
            open.value = false
            getList()
            ElMessage.success(res.message)
          } else {
            ElMessage.error(res.message)
          }
        })
      } else {
        // 否则就是添加新数据
        add(form.value).then(res => {
          if (res.success) {
            open.value = false
            getList()
            ElMessage.success(res.message)
          } else {
            ElMessage.error(res.message)
          }
        })
      }
    } else {
      console.log('没有通过校验:', fields)
    }
  })


}
</script>

<style scoped></style>
