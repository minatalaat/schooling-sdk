import { useGetUrl } from '../useGetUrl';
import { getFilterString } from '../../utils/helpers';
import { useAxiosFunction } from '../../hooks/useAxios';
import { useGetHeaders } from '../useGetHeaders';

export const useClassesServices = () => {
  //get class
  const { api } = useAxiosFunction();
  const { getClasses, getAttendance, getLoopkups } = useGetUrl();
  const { getHeaders } = useGetHeaders();

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
    await api('POST', getClasses() + '/' + id + '/update', body, successHandler, null, null, {
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
    await api('POST', getClasses() + '/0' + '/delete', body, successHandler, null, null, {
      'X-USER-TYPE': 'ADMIN',
    });
  };

  return { fetchClasses, addClass, fetchStudentAttendance, fetchClass, deleteClass, updateClass, fetchAvailableGrades };
};
