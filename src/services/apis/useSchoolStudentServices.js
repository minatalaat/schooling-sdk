import { getSchools } from '../getUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';

export const useSchoolStudentServices = () => {
  // Get Class Students
  const { api } = useAxiosFunction();

  const fetchClassStudents = async (filter, schoolId, classId, successHandler) => {
    const res = await api(
      'GET',
      getSchools() + '/' + schoolId + '/classes/' + classId + '/students' + getFilterString(filter),
      null,
      successHandler,
      null,
      null,
      {
        'X-USER-TYPE': 'ADMIN',
      }
    );
    return { data: res?.data?.returnedObject?.records, total: res?.data?.returnedObject?.total_records };
  };

  //Add Students to Class
  const addStudentToClass = async (schoolId, classId, body, successHandler) => {
    await api('POST', getSchools() + '/' + schoolId + '/classes/' + classId + '/students', body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
  };

  //Remove Students from Class
  const deleteStudentFromClass = async (schoolId, classId, body, successHandler) => {
    const res = await api('POST', getSchools() + '/' + schoolId + '/classes/' + classId + '/students' + "/delete", body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
    return { data: res?.data?.returnedObject?.records, total: res?.data?.returnedObject?.total_records };
  };

  // Get All Supervisors
  const fetchSchoolSupervisors = async (filter, successHandler) => {
    const res = await api('GET', getSchools() + '/supervisors' + getFilterString(filter), null, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
    return { data: res?.data?.returnedObject?.records, total: res?.data?.returnedObject?.total_records };
  };

  //Create Supervisor
  const addSupervisor = async (body, successHandler) => {
    await api('POST', getSchools() + '/supervisors', body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
  };

  //Get supervisor
  const fetchSupervisor = async (id, successHandler) => {
    const res = await api('GET', getSchools() + '/supervisors/' + id, null, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
    return res?.data?.returnedObject || {};
  };

  //Update supervisors
  const updateSupervisor = async (id, body, successHandler) => {
    await api('POST', getSchools() + '/supervisors/' + id + "/update", body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
  };

  //Delete Supervisor
  const deleteSupervisor = async (body, successHandler) => {
    await api('POST', getSchools() + '/supervisors' + "/delete", body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
  };

  const importGrades = async (body, successHandler, errorHandler) => {
    const res = await api('POST', getSchools() + '/uploadGrades', body, successHandler, errorHandler);
    return res?.data?.returnedObject;
  };

  // Get Grades
  const fetchGrades = async (filter, successHandler) => {
    const res = await api('GET', getSchools() + '/grades' + getFilterString(filter), null, successHandler);
    return { data: res?.data?.returnedObject?.records, total: res?.data?.returnedObject?.total_records };
  };

  const fetchStudentGrades = async (id, filter, successHandler) => {
    const res = await api('GET', getSchools() + '/grades/' + id + getFilterString(filter), null, successHandler);
    return { data: res?.data?.returnedObject };
  };

  return {
    deleteStudentFromClass,
    addStudentToClass,
    fetchClassStudents,
    fetchSchoolSupervisors,
    addSupervisor,
    fetchSupervisor,
    updateSupervisor,
    deleteSupervisor,
    importGrades,
    fetchGrades,
    fetchStudentGrades,
  };
};
