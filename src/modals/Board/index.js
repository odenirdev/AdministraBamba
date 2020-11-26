import React, { useState, useEffect, useCallback, useContext } from "react";
import Styled from "styled-components";
import { FaEdit, FaTrash, FaPaperPlane, FaTimes } from "react-icons/fa";
import { Row } from "react-bootstrap";
import { useHistory } from "react-router-dom";

import Form, {
    Input,
    GridButtons,
    TextArea,
    ReactSelect,
} from "../../components/Form";
import Button from "../../components/Button";
import Label from "../../components/Label";

import AuthContext from "../../components/AuthContext";
import BoardContext from "../../components/Board/context";

import Api from "../../services/api";
import Notification, { Error } from "../../modules/notifications";
import Confirm from "../../modules/alertConfirm";

const Container = Styled.div`
    display: flex;
    justify-content: center;
`;

const Contributor = Styled.div`
    background-color: var(--gray-5);
    width: fit-content;
    margin: 10px 10px;
    border-radius: 2px;
    display: flex;

    & span {
        margin: 5px 10px;
    }

    & div {
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;

        & svg {
            margin: 0 10px;
        }

        &:hover {
            background-color: var(--red-1);
            color: var(--gray-5);
        }
    }
`;

const Index = ({ onClose, index: indexBoards }) => {
    const history = useHistory();

    const [data, setData] = useState({ users: [] });

    const [users, setUsers] = useState([]);

    const { data: board, index } = useContext(BoardContext);

    const {
        auth: { me },
    } = useContext(AuthContext);

    useEffect(() => {
        if (board) {
            if (Array.isArray(board.users)) {
                const usersContributing = board.users.map((user) => ({
                    value: user.id,
                    label: user.username,
                }));

                setData({
                    ...board,
                    users: usersContributing,
                    creator: board.creator.id,
                });
            }
        } else {
            setData(board);
        }
    }, [board]);

    useEffect(() => {
        async function indexUsers() {
            try {
                const response = await Api.get(`/users?_limit=-1`);

                const serializedUsers = response.data.map((user) => ({
                    value: user.id,
                    label: user.username,
                }));

                if (data && Array.isArray(data.users)) {
                    const contributorsID = data.users.map((user) => user.value);

                    let filteredUsers = serializedUsers.filter((user) => {
                        if (me.id === user.value) {
                            return false;
                        }

                        return !contributorsID.includes(user.value);
                    });

                    setUsers(filteredUsers);
                }
            } catch (error) {
                Error(error);
            }
        }

        indexUsers();
    }, [board, data, me]);

    const handleSelectContributing = useCallback(
        (user) => {
            const filteredUsers = users.filter(
                (filterUser) => filterUser.value !== user.value
            );

            setUsers(filteredUsers);

            if (Array.isArray(data.users)) {
                setData({ ...data, users: [...data.users, user] });
            } else {
                setData({ ...data, users: [user] });
            }
        },
        [data, users]
    );

    function handleRemoveContributor(user) {
        const newUsers = [...users, user];

        setUsers(newUsers);

        const filteredContributors = data.users.filter(
            (filteredUser) => filteredUser.value !== user.value
        );

        setData({ ...data, users: filteredContributors });
    }

    function handleValidate() {
        if (!data.title) {
            return { status: false, message: "Título é obrigatório" };
        }

        if (!data.description) {
            return { status: false, message: "Descrição é obrigatório" };
        }

        return { status: true };
    }

    async function create(data) {
        try {
            const response = await Api.post("/boards", {
                ...data,
                creator: me.id,
            });

            try {
                await Api.post("/logs", {
                    entity: 1,
                    type: 0,
                    data: response.data,
                    createdAt: new Date(),
                    user: me.id,
                });
            } catch (error) {
                await Api.delete(`/boards/${response.data.id}`);

                return Error(error);
            }

            indexBoards();
            onClose();
            Notification("success", "Quadro cadastrado");
        } catch (error) {
            Error(error);
        }
    }

    async function update(data) {
        try {
            const response = await Api.put(`/boards/${data.id}`, data);

            try {
                await Api.post("/logs", {
                    entity: 1,
                    type: 1,
                    data: response.data,
                    createdAt: new Date(),
                    user: me.id,
                });
            } catch (error) {
                await Api.put(`/boards/${data.id}`, board);

                return Error(error);
            }

            index();
            onClose();
            Notification("success", "Quadro atualizado");
        } catch (error) {
            Error(error);
        }
    }

    function destroy() {
        Confirm(
            "Remover Quadro",
            "Essa operação não pode ser desfeita, tem certeza ?",
            async () => {
                try {
                    data.lists.forEach((list) => {
                        list.tasks.map(async (task) => {
                            await Api.delete(`/tasks/${task.id}`);
                        });
                    });

                    await Api.delete(`/boards/${data.id}`);

                    try {
                        await Api.post("/logs", {
                            entity: 1,
                            type: 2,
                            data: data,
                            createdAt: new Date(),
                            user: me.id,
                        });
                    } catch (error) {
                        data.tasks.map(async (task) => {
                            await Api.post(`/tasks`, task);
                        });

                        await Api.post(`/boards/`, data);
                        return Error(error);
                    }

                    Notification("success", "Quadro removido");
                    history.push("/boards");
                } catch (error) {
                    Error(error);
                }
            }
        );
    }

    function handleSubmit(e) {
        e.preventDefault();
        const validate = handleValidate();
        if (!validate.status) {
            return Notification("warning", validate.message);
        }

        let requestData;
        if (Array.isArray(data.users)) {
            const users = data.users.map((user) => user.value);

            requestData = { ...data, users };
        } else {
            requestData = { ...data, users: [] };
        }

        if (data.id) {
            update(requestData);
            return;
        }

        return create(requestData);
    }

    return (
        <Container>
            <Form max-width="70%" sm-max-width="100%" onSubmit={handleSubmit}>
                <Input
                    label="Título*"
                    onChange={(event) =>
                        setData({ ...data, title: event.target.value })
                    }
                    maxLength={30}
                    value={data && (data.title || "")}
                />
                <TextArea
                    label="Descrição*"
                    onChange={(event) =>
                        setData({ ...data, description: event.target.value })
                    }
                    maxLength={280}
                    value={data && (data.description || "")}
                />
                {me.role && me.role.id >= 3 && (
                    <Label>
                        Contribuidores
                        <Row>
                            {data && Array.isArray(data.users) && (
                                <>
                                    {data.users.map((user) => (
                                        <div key={user.value}>
                                            {me.id !== user.value && (
                                                <Contributor>
                                                    <span>{user.label}</span>
                                                    <div
                                                        onClick={() => {
                                                            handleRemoveContributor(
                                                                user
                                                            );
                                                        }}
                                                    >
                                                        <FaTimes />
                                                    </div>
                                                </Contributor>
                                            )}
                                        </div>
                                    ))}
                                </>
                            )}
                        </Row>
                        <ReactSelect
                            options={users}
                            onChange={(event) => {
                                handleSelectContributing(event);
                            }}
                        />
                    </Label>
                )}
                <GridButtons>
                    {!board ? (
                        <Button type="submit">
                            <FaPaperPlane />
                            Confirmar
                        </Button>
                    ) : (
                        <>
                            {((data && data.creator === me.id) ||
                                (me.role && me.role.id >= 3)) && (
                                <>
                                    <Button
                                        color="var(--red-1)"
                                        variant="secundary"
                                        onClick={destroy}
                                    >
                                        <FaTrash />
                                        Remover
                                    </Button>
                                    <Button type="submit">
                                        <FaEdit />
                                        Editar
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </GridButtons>
            </Form>
        </Container>
    );
};

export default Index;
