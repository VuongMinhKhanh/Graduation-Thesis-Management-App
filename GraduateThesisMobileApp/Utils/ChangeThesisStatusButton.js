import React from "react";
import { Button, Dialog, Portal, Paragraph } from 'react-native-paper';
import APIs, { authApi, endpoints } from "../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangeThesisStatusButton = ({ thesisId, status, loading, setTheses, setThesis, navigation }) => {
    const [confirmDialogVisible, setConfirmDialogVisible] = React.useState(false);
    const [dialogMessage, setDialogMessage] = React.useState('');
    const [dialogVisible, setDialogVisible] = React.useState(false);
    const [thisStatus, setThisStatus] = React.useState(status)

    const changeThesisStatus = async (newStatus) => {
        try {
            // Assuming the API call method is correctly defined
            let access_token = await AsyncStorage.getItem('token')
            await authApi(access_token).patch(endpoints['change_thesis_status'](thesisId), { trang_thai: newStatus });
            
            setDialogMessage('Thesis status changed successfully.');
            setDialogVisible(true);

            // onStatusChange(); // Callback to refresh the list
            // Real-time change thesis status
            setTheses((prevThesis) => {
                // console.log()
                return prevThesis.map((item) => {
                    if (item.id === thesisId) {
                        return { ...item, trang_thai: newStatus };
                    }
                    return item;
                });
            });

            if (setThesis) {
                // console.log(newStatus)
                setThesis((prevThesis) => ({
                    ...prevThesis, trang_thai: !prevThesis.trang_thai // why newStatus is always false
                }))
            }
            setThisStatus(!thisStatus)
            // if (navigation) {
            //     navigation.navigate("ThesesList");
            // }
            
        } catch (error) {
            console.error('Failed to change thesis status:', error);
            setDialogMessage('Failed to change thesis status.');
            setDialogVisible(true);
        }
    };

    return (
        <>
            <Portal>
                <Dialog
                    visible={confirmDialogVisible}
                    onDismiss={() => setConfirmDialogVisible(false)}
                >
                    <Dialog.Title>Confirm Action</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>Are you sure you want to change the status of this thesis?</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setConfirmDialogVisible(false)}>Cancel</Button>
                        <Button onPress={() => {
                            setConfirmDialogVisible(false);
                            changeThesisStatus(!status);
                        }}>Confirm</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Portal>
                <Dialog
                    visible={dialogVisible}
                    onDismiss={() => setDialogVisible(false)}
                >
                    <Dialog.Title>Status Update</Dialog.Title>
                    <Dialog.Content>
                        <Paragraph>{dialogMessage}</Paragraph>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button 
                        onPress={() => {
                            setDialogVisible(false)
                            // {navigation?.navigation.navigate("ThesesList")}  // Navigate after OK is clicked
                        }}
                        >OK</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
            <Button
                mode={navigation===undefined
                    ? (thisStatus ? 'contained' : 'contained-tonal')
                    : (thisStatus ? 'outlined' : 'elevated')}
                onPress={() => setConfirmDialogVisible(true)}
                disabled={loading}
            >
                {thisStatus ? 'Conclude' : 'Reopen'}
            </Button>
        </>
    )
}

export default ChangeThesisStatusButton;