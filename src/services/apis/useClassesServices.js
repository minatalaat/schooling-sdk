import { getAttendance, getClasses, getLoopkups } from '../getUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';
import { getHeaders } from '../getHeaders';

export const useClassesServices = () => {
  //get class
  const { api } = useAxiosFunction();
  getHeaders(getClasses(), { 'X-USER-TYPE': 'ADMIN' });

  const fetchClass = async (id, successHandler) => {
    const res = await api('GET', getClasses() + '/' + id, null, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
    return res?.data?.returnedObject || {};
  };

  //Get All ClassRooms
  const fetchClasses = async (filter, successHandler) => {
    const res = await api('GET', getClasses() + getFilterString(filter), null, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
    return { data: res?.data?.returnedObject?.records, total: res?.data?.returnedObject?.total_records };
  };

  //Create ClassRoom
  const addClass = async (body, successHandler) => {
    await api('POST', getClasses(), body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
  };

  // Get Student Attendance
  const fetchStudentAttendance = async (filter, studentId, classId, successHandler) => {
    const res = await api(
      'GET',
      getAttendance() + '/' + classId + '/' + studentId + getFilterString(filter),
      null,
      successHandler,
      null,
      null,
      {
        'X-USER-TYPE': 'ADMIN',
      }
    );
    return { data: res?.data?.returnedObject, total: res?.data?.returnedObject?.total_records };
  };

  //Update ClassRoom
  const updateClass = async (id, body, successHandler) => {
    await api('PUT', getClasses() + '/' + id, body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
  };

  //Get Available Grades
  const fetchAvailableGrades = async () => {
    const res = await api('GET', getLoopkups() + '/grades', null, null, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
    return { data: res?.data || [] };
  };

  //Delete class
  const deleteClass = async (body, successHandler) => {
    await api('DELETE', getClasses() + '/0', body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
  };

  return { fetchClasses, addClass, fetchStudentAttendance, fetchClass, deleteClass, updateClass, fetchAvailableGrades };
};
