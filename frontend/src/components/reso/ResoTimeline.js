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
        title: 'Richiesto',
        apiStatus: ['RICHIESTO'],
        icon: <div style={iconWrapperStyle}><ContainerOutlined/></div>,
    },
    {
        title: 'Da Restituire',
        apiStatus: ['DA_RESTITUIRE'],
        icon: <div style={iconWrapperStyle}><InboxOutlined/></div>,
    },
    {
        title: 'Spedito',
        apiStatus: ['SPEDITO'],
        icon: <div style={iconWrapperStyle}><TruckOutlined/></div>,
    },
    {
        title: 'Ricevuto',
        apiStatus: ['RICEVUTO'],
        icon: <div style={iconWrapperStyle}><HomeOutlined/></div>,
    },
    {
        title: 'Elaborato',
        apiStatus: ['ELABORATO'],
        icon: <div style={iconWrapperStyle}><CheckCircleOutlined/></div>,
    },
    {
        title: 'Effettuato',
        apiStatus: ['EFFETTUATO'],
        icon: <div style={iconWrapperStyle}><CheckCircleOutlined/></div>,
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
            {allSteps.map((step, index) => {
                const statusKey = step.apiStatus[0];
                const date = stati[statusKey];
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