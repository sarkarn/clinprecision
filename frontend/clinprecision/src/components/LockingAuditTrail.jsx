import React, { useState, useEffect } from 'react';
import { Table, Card, Tabs, Select, DatePicker, Space, Typography, Tag } from 'antd';
import { LockOutlined, UnlockOutlined, UserOutlined, FileOutlined, BookOutlined } from '@ant-design/icons';
import moment from 'moment';
import LockingAuditService from '../services/LockingAuditService';

const { TabPane } = Tabs;
const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Component for displaying locking audit trail
 */
const LockingAuditTrail = ({ entityId, entityType, userId }) => {
    const [audits, setAudits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [filteredAudits, setFilteredAudits] = useState([]);

    useEffect(() => {
        fetchAudits();
    }, [entityId, entityType, userId, activeTab]);

    useEffect(() => {
        // Apply date range filter when audits or date range changes
        if (dateRange && dateRange.length === 2) {
            const [start, end] = dateRange;
            const filtered = audits.filter(audit => {
                const auditDate = moment(audit.createdAt);
                return auditDate.isSameOrAfter(start) && auditDate.isSameOrBefore(end);
            });
            setFilteredAudits(filtered);
        } else {
            setFilteredAudits(audits);
        }
    }, [audits, dateRange]);

    const fetchAudits = async () => {
        setLoading(true);
        try {
            let response;

            if (activeTab === 'entity' && entityId) {
                response = await LockingAuditService.getAuditForEntity(entityId);
            } else if (activeTab === 'type' && entityType) {
                response = await LockingAuditService.getAuditForEntityType(entityType);
            } else if (activeTab === 'user' && userId) {
                response = await LockingAuditService.getAuditForUser(userId);
            } else {
                response = await LockingAuditService.getAllAudits();
            }

            if (response.data) {
                setAudits(response.data);
                setFilteredAudits(response.data);
            }
        } catch (error) {
            console.error('Error fetching audit trail:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleDateRangeChange = (dates) => {
        setDateRange(dates);
    };

    const columns = [
        {
            title: 'Entity Type',
            dataIndex: 'entityType',
            key: 'entityType',
            render: (text) => {
                const icon = text === 'STUDY' ? <BookOutlined /> : <FileOutlined />;
                return (
                    <Tag icon={icon} color={text === 'STUDY' ? 'blue' : 'green'}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Entity ID',
            dataIndex: 'entityId',
            key: 'entityId',
            ellipsis: true,
        },
        {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            render: (text) => {
                const icon = text === 'LOCK' ? <LockOutlined /> : <UnlockOutlined />;
                const color = text === 'LOCK' ? 'red' : 'green';
                return (
                    <Tag icon={icon} color={color}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            ellipsis: true,
        },
        {
            title: 'User',
            dataIndex: 'userId',
            key: 'userId',
            render: (text) => (
                <Tag icon={<UserOutlined />} color="purple">
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Timestamp',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => moment(text).format('YYYY-MM-DD HH:mm:ss'),
            sorter: (a, b) => moment(a.createdAt).valueOf() - moment(b.createdAt).valueOf(),
            defaultSortOrder: 'descend',
        },
    ];

    return (
        <Card>
            <Title level={4}>Locking Audit Trail</Title>

            <Space style={{ marginBottom: 16 }}>
                <RangePicker onChange={handleDateRangeChange} />
            </Space>

            <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane tab="All Audits" key="all" />
                {entityId && <TabPane tab="Entity Audits" key="entity" />}
                {entityType && <TabPane tab="Entity Type Audits" key="type" />}
                {userId && <TabPane tab="User Audits" key="user" />}
            </Tabs>

            <Table
                columns={columns}
                dataSource={filteredAudits}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </Card>
    );
};

export default LockingAuditTrail;
