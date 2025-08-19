import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import MainLayout from '../layouts/main'
import AuthLayout from '../layouts/auth'
import {AuthProvider} from "../services/auth/auth";
import LoginPage from "../modules/auth/pages/LoginPage";
import PrivateRoute from "../services/auth/PrivateRoute";
import AgreementsPage from "../modules/agreement/pages/AgreementsPage";
import AgreementCreatePage from "../modules/agreement/pages/AgreementCreatePage";
import AgreementEditPage from "../modules/agreement/pages/AgreementEditPage";

const Index = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<AuthLayout>
                        <LoginPage/>
                    </AuthLayout>}/>

                    <Route
                        path={"/claims"}
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgreementsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/claim/create"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgreementCreatePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/claims/edit/:id"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgreementEditPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />

                    <Route path={"/"} element={<Navigate to={'/claims'} replace/>}/>
                    <Route path={"*"} element={<Navigate to={'/'} replace/>}/>
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default Index;
