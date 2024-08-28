export const useAnalyticLinesServices = () => {
    const onAnalyticAxisSuccess = response => {
      if (response.data.status === 0) {
        let data = response.data.data;
        let axises = [];
  
        if (data) {
          data.forEach(axis => {
            let temp = {
              id: axis?.id ?? -1,
              code: axis?.code ?? '',
              name: axis?.name ?? '',
            };
            axises.push(temp);
          });
        }
  
        return { displayedData: [...axises], total: response.data.total || 0 };
      }
    };
  
    const onAnalyticAccountSuccess = response => {
      if (response.data.status === 0) {
        let data = response.data.data;
        let analyticAccounts = [];
  
        if (data) {
          data.forEach(account => {
            let temp = {
              id: account?.id ?? -1,
              code: account?.code ?? '',
              fullName: account?.fullName ?? '',
              analyticAxis: account?.analyticAxis ?? '',
              parentAnalyticAxis: account?.parent ?? '',
              status: account?.statusSelect ? 'Active' : 'Not Active',
            };
            analyticAccounts.push(temp);
          });
        }
  
        return { displayedData: [...analyticAccounts], total: response.data.total || 0 };
      }
    };
  
    return { onAnalyticAxisSuccess, onAnalyticAccountSuccess };
  };
