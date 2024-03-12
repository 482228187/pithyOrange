<template>
  <el-card>
    <template #header>
      <span>{{ title }}</span>
    </template>
    <el-form :disabled="title === '详 情'" @click="title = '修 改'" ref="surveyRef" :model="formdata" :inline="true"
      size="small" :rules="rules">
      <el-form-item label="标题" prop="title">
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" v-model="formdata.title"
          placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" v-model="formdata.description"
          placeholder="请输入描述"></el-input>
      </el-form-item>
      <el-form-item label="开始时间" prop="start_time">
        <el-date-picker v-model="formdata.start_time" type="datetime" placeholder="选择开始日期时间" />
      </el-form-item>
      <el-form-item label="结束时间" prop="end_time">
        <el-date-picker v-model="formdata.end_time" type="datetime" placeholder="选择结束日期时间" />
      </el-form-item>
      <el-form-item label="填写联系方式" prop="need_contact">
        <el-select v-model="formdata.need_contact" placeholder="请选择">
          <el-option label="是" value="yes"></el-option>
          <el-option label="否" value="no"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="联系方式类型" v-if="formdata.need_contact === 'yes'" prop="contact_type">
        <el-select v-model="formdata.contact_type" placeholder="请选择">
          <el-option label="手机号" value="phone"></el-option>
          <el-option label="邮箱" value="email"></el-option>
          <el-option label="手机号或邮箱" value="phone|mail"></el-option>
          <el-option label="不限制" value="other"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="可重复提交" prop="repeat">
        <el-select v-model="formdata.repeat" placeholder="请选择">
          <el-option label="是" value="yes"></el-option>
          <el-option label="否" value="no"></el-option>
          <el-option label="更新" value="update"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="重复提交检查方式" prop="repeat_check">
        <el-select v-model="formdata.repeat_check" placeholder="请选择">
          <el-option v-if="formdata.need_contact === 'yes'" label="联系方式" value="contact"></el-option>
          <el-option label="浏览器指纹" value="finger"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="水印" prop="water_mark">
        <el-input type="textarea" :autosize="{ minRows: 1, maxRows: 3 }" v-model="formdata.water_mark"
          placeholder="请输入水印"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(surveyRef)">确定</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
<script setup>
import { list, add, del, update, get } from "@/api/admin/survey.js";
import { ref, onMounted, watch} from 'vue'
const props = defineProps({
  form: Object,
  isDetail: String
})

const surveyRef = ref()
const title = ref('新 增')
const formdata = ref({
  option: []
})
searchId.value = props.surveyId
// 校验规则
const rules = ({
  title: [{ required: true, message: '请填写', trigger: 'blur' }],
  description: [{ required: true, message: '请填写', trigger: 'blur' }],
  need_contact: [{ required: true, message: '请填写', trigger: 'blur' }],
  contact_type: [{ required: true, message: '请填写', trigger: 'blur' }],
  repeat: [{ required: true, message: '请填写', trigger: 'blur' }],
  repeat_check: [{ required: true, message: '请填写', trigger: 'blur' }],
  start_time: [{ required: true, message: '请填写', trigger: 'blur' }],
  end_time: [{ required: true, message: '请填写', trigger: 'blur' }],
})
// 监听选择的变化
watch(() => props.form, (newValue, oldValue) => {
  if (newValue) {
 
    formdata.value = newValue
    console.log(props.isDetail)
    title.value = props.isDetail
     
  }
});


// 新增或者更改问卷信息
function submitForm(elForm) {
  elForm.validate((valid) => {
    // 如果校验通过
    if (valid) {
      if (formdata.value.id) {
        // 有ID则更新数据
        update(formdata.value).then(res => {
          if (res.success) {
            ElMessage.success('修改成功！');
            getList()
          } else {
            ElMessage.error('修改失败！');
          }
        })
      } else {
        // 没有ID代表新增数据
        add(formdata.value).then(res => {
          if (res.success) {
            ElMessage.success('新增成功！');
            reset()
            getList()
          } else {
            ElMessage.error('新增失败！');
          }
        })
      }
    }
  })
}

</script>
<style scoped></style>