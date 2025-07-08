import React from 'react';
import {Steps} from 'antd';
import {
    ContainerOutlined,
    InboxOutlined,
    TruckOutlined,
    HomeOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';

const {Step} = Steps;

// Stile per il cerchio che conterrà l'icona
const iconWrapperStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    position: 'relative',

    top: '-8px', // Sposta l'icona verso l'alto per allinearla con il bordo superiore dello step
    left: '-8px', // Sposta l'icona verso sinistra per centrarla rispetto allo step
    border: '3px solid', // Il colore del bordo verrà ereditato dallo stato del componente Step
};

const customTimelineStyles = `
  .ant-steps-item-tail::after {
    width: 3px !important;
  }
`;

// Definisci tutti gli step fuori dal componente per evitare di ricrearli ad ogni render
const allSteps = [
    {
        title: 'Reso Creato',
        apiStatus: ['IN_ATTESA'],
        icon: <div style={iconWrapperStyle}><ContainerOutlined/></div>,
        description: null
    },
    {
        title: 'In Preparazione',
        apiStatus: ['IN_PREPARAZIONE'],
        icon: <div style={iconWrapperStyle}><InboxOutlined/></div>,
        description: null
    },
    {
        title: 'Spedito',
        apiStatus: ['SPEDITO'],
        icon: <div style={iconWrapperStyle}><TruckOutlined/></div>,
        description: null
    },
    {
        title: 'In Consegna',
        apiStatus: ['IN_CONSEGNA'],
        icon: <div style={iconWrapperStyle}><HomeOutlined/></div>,
        description: null
    },
    {
        title: 'Consegnato',
        apiStatus: ['CONSEGNATO'],
        icon: <div style={iconWrapperStyle}><CheckCircleOutlined/></div>,
        description: null
    },
];

const ResoTimeline = ({current, stati}) => {
    // Trova l'indice dello stato attuale
    const currentStepIndex = allSteps.findIndex(step => step.apiStatus.includes(current));

    const getStatusForStep = (index) => {
        if (index === currentStepIndex) {
            return 'process';
        } else if (index < currentStepIndex) {
            return 'finish';
        } else {
            return 'wait';
        }
    };

    return (
        <Steps
            current={currentStepIndex}
            labelPlacement="vertical"
        >
            {allSteps.map((step, index) =>  {
                const statusKey = step.apiStatus[0];
                const date = stati[statusKey] ;
                const description = date ? new Date(date).toLocaleString() : null;

                return (<Step
                    key={step.title}
                    title={step.title}
                    icon={step.icon}
                    status={getStatusForStep(index)}
                description={description}
                />);
            })}
        </Steps>
    );
};

export default ResoTimeline;