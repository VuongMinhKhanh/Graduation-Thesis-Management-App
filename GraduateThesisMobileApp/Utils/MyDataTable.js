import * as React from 'react';
import { DataTable } from 'react-native-paper';
import MyStyles from './MyStyles';
// import { LogBox } from 'react-native';

// LogBox.ignoreLogs(["Each child in a list should have a unique 'key' prop"])

const MyDataTable = ({ titles, data }) => {
  const [page, setPage] = React.useState(0);
  const [numberOfItemsPerPageList] = React.useState([2, 3, 4]);
  const [itemsPerPage, onItemsPerPageChange] = React.useState(
    numberOfItemsPerPageList[0]
  );

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, data.length);

  React.useEffect(() => {
    setPage(0);
  }, [itemsPerPage]);

  return (
    <DataTable style={{backgroundColor: "lightyellow", borderRadius: 10, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4, // for Android
      }}>
      <DataTable.Header>
        {titles && titles.map((item) => {
            return <>
                {item!=="Tên khóa luận"
                ?<DataTable.Title numeric>{item}</DataTable.Title>
                :<DataTable.Title>{item}</DataTable.Title>}
            </>
        })
        }
      </DataTable.Header>
      {data.slice(from, to).map((item, index) => (
        <DataTable.Row key={index} style={index % 2 === 0 ? MyStyles.row : {}}>
            <>
                <DataTable.Cell>{item.ten_khoa_luan}</DataTable.Cell>
                <DataTable.Cell numeric>{item.diem_tong}</DataTable.Cell>
                <DataTable.Cell numeric>{item.created_date__year}/{item.created_date__month}/{item.created_date__day}</DataTable.Cell>
            </>
        </DataTable.Row>
      ))}

      <DataTable.Pagination
        page={page}
        numberOfPages={Math.ceil(data.length / itemsPerPage)}
        onPageChange={(page) => setPage(page)}
        label={`${from + 1}-${to} of ${data.length}`}
        numberOfItemsPerPageList={numberOfItemsPerPageList}
        numberOfItemsPerPage={itemsPerPage}
        onItemsPerPageChange={onItemsPerPageChange}
        showFastPaginationControls
        selectPageDropdownLabel={'Rows per page'}
      />
    </DataTable>
  );
};

export default MyDataTable;