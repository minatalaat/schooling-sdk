import { getStudents } from '../getUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';

export const useStudentsServices = () => {
  const { api } = useAxiosFunction();

  const fetchStudents = async (filter, successHandler, errorHandler) => {
    const res = await api('GET', getStudents() + getFilterString(filter), null, successHandler, errorHandler);
    return { data: res?.data?.returnedObject?.students, total: res?.data?.returnedObject?.total_records };
  };

  const fetchStudent = async (id, successHandler, errorHandler) => {
    const res = await api('GET', getStudents() + '/' + id, null, successHandler, errorHandler);
    return res?.data?.returnedObject;
  };

  const deleteStudent = async (body, successHandler) => {
    await api('POST', getStudents() + '/0' + "/delete", body, successHandler);
  };

  const importStudents = async (body, successHandler, errorHandler) => {
    const res = await api('POST', getStudents() + '/' + 'uploadStudentsInfo', body, successHandler, errorHandler);
    return res?.data?.returnedObject;
  };

  const getStudentByBriclitCode = async body => {
    const res = await api('GET', getStudents() + '/' + 'validate', body);
    return res?.data?.returnedObject;
  };

  return { fetchStudents, fetchStudent, deleteStudent, importStudents, getStudentByBriclitCode };
};
