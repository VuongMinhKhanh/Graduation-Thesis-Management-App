import axios from "axios";

// const BASE_URL = 'https://thanhduong.pythonanywhere.com/';
// const BASE_URL = 'http://192.168.0.105:8000/';
export const BASE_URL = 'http://hoangila2016.pythonanywhere.com/';

export const endpoints = {
    'avg_scores': '/KLTN/avg_score/',
    'freq': '/KLTN/frequency/',
    'theses': '/KLTN/',
    'student_thesis': (stu_id) => `/KLTN/?stu_id=${stu_id}`,
    'change_thesis_status': (statusId) => `/KLTN/${statusId}/change_thesis_status/`,
    'thesis_details': (thesisId) => `/KLTNDetails/${thesisId}/get_thesis_details/`,
    'score_details': (thesisId) => `/Diem/${thesisId}/get_thesis_scores/`,
    'export_pdf': (thesisId) => `/Diem/${thesisId}/export_pdf/`,
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'current_score': (thesisId) => `/Diem/${thesisId}/calculate_current_score/`,
    'HDBVKL': (lecturerId) => `/HDBVKL/?giang_vien=${lecturerId}`,
    'add_council': '/HDBVKL/add/',
    'TieuChi': '/TieuChi/',
    'GiangVien':'giang_vien',
    'addTheses': '/KLTN/add/',
    'thesisDetails': (id) => `/KLTNDetails/${id}/get_thesis_details/`,
    'getLecturers': (name) => `/giang_vien/?giang_vien=${name}`,
    'getStudents': (name) => `/sinh_vien/?sinh_vien=${name}`,
    'NguoiDung': "users",
    'EmailConfirm': 'EmailConfirm',
};

export const addTheses = async (thesesData) => {
    try {
        const response = await axios.post(`${HOST}${endpoints.addTheses}`, thesesData);
        return response.data;
    } catch (error) {
        console.error("API error:", error.response.data);
        return error.response.data;
    }
};

export const getThesisDetails = async (id) => {
    try {
        const response = await axios.get(`${HOST}${endpoints.thesisDetails(id)}`);
        return response.data;
    } catch (error) {
        console.error("API error:", error.response.data);
        return error.response.data;
    }
};

export const authApi = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});