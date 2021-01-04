import React, { useState, useContext } from "react";
import { FaFolder } from "react-icons/fa";

import Table, { ResponsiveTable } from "../../components/Table";
import AddButton from "../AddButton";
import Modal from "../Modal";

import UnitOfMeasurementModal from "../../modals/UnitOfMeasurement";

import Context from "./context";

import { Container } from "./styles";

function Index() {
    const [show, setShow] = useState(false);

    const [selected, setSelected] = useState({});

    const { data, index } = useContext(Context);

    function handleAddModal() {
        setSelected({});
        setShow(true);
    }

    function handleOnCloseModal() {
        setSelected({});
        setShow(false);
    }

    function handleOpenModal(data) {
        setSelected(data);
        setShow(true);
    }
    return (
        <>
            <Modal
                {...{ show }}
                onClose={handleOnCloseModal}
                title={`${
                    Object.keys(selected).length === 0 ? "Nova" : selected.name
                } unidade de medida`}
            >
                <UnitOfMeasurementModal
                    onClose={handleOnCloseModal}
                    reload={index}
                    {...{ selected }}
                />
            </Modal>
            <Container>
                <header>
                    <h1>Unidades de Medida</h1>
                    <AddButton onClick={handleAddModal} />
                </header>
                {data.length !== 0 && (
                    <ResponsiveTable>
                        <Table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Abrev.</th>
                                    <th className="d-flex justify-content-center">
                                        Abrir
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((unity) => (
                                    <tr>
                                        <td>{unity.name}</td>
                                        <td>{unity.abbr || "-"}</td>
                                        <td className="d-flex justify-content-center">
                                            <FaFolder
                                                className="open-icon"
                                                onClick={() => {
                                                    handleOpenModal(unity);
                                                }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </ResponsiveTable>
                )}
            </Container>
        </>
    );
}

export default Index;
