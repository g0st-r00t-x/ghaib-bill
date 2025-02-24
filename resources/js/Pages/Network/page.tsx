import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Globe2, Wifi } from 'lucide-react';
import { DynamicForm } from '@/Components/Forms/DynamicForm';

const NetworkConfigurationForm = () => {
  const networkFields = [
    {
      name: 'networkName',
      label: 'Network Name',
      type: 'text',
      placeholder: 'Enter network name',
      validation: {
        required: true,
        minLength: 3,
        maxLength: 50,
        message: 'Network name must be between 3 and 50 characters'
      },
      description: 'Choose a unique name for your network'
    },
    {
      name: 'networkType',
      label: 'Network Type',
      type: 'select',
      options: [
        { label: 'Wireless (WiFi)', value: 'wifi' },
        { label: 'Ethernet', value: 'ethernet' },
        { label: 'VPN', value: 'vpn' }
      ],
      validation: {
        required: true,
        message: 'Please select a network type'
      },
      description: 'Select the type of network you want to create'
    },
    {
      name: 'ipAddress',
      label: 'IP Address',
      type: 'text',
      placeholder: '192.168.1.1',
      validation: {
        required: true,
        pattern: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
        message: 'Please enter a valid IP address'
      },
      description: 'Enter the network IP address'
    },
    {
      name: 'subnetMask',
      label: 'Subnet Mask',
      type: 'text',
      placeholder: '255.255.255.0',
      validation: {
        required: true,
        pattern: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
        message: 'Please enter a valid subnet mask'
      },
      description: 'Enter the subnet mask'
    },
    {
      name: 'dhcpEnabled',
      label: 'Enable DHCP',
      type: 'checkbox',
      description: 'Automatically assign IP addresses to devices'
    },
    {
      name: 'gateway',
      label: 'Default Gateway',
      type: 'text',
      placeholder: '192.168.1.1',
      validation: {
        required: true,
        pattern: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
        message: 'Please enter a valid gateway address'
      },
      description: 'Enter the default gateway address'
    },
    {
      name: 'description',
      label: 'Network Description',
      type: 'textarea',
      placeholder: 'Enter network description...',
      validation: {
        maxLength: 500,
        message: 'Description cannot exceed 500 characters'
      },
      description: 'Provide additional details about the network'
    }
  ];

  const handleSubmit = (data: any) => {
    console.log('Network Configuration:', data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <Globe2 className="w-6 h-6 text-blue-500" />
            <CardTitle className="text-2xl font-bold text-blue-900">
              Network Configuration
            </CardTitle>
          </div>
          <p className="text-gray-500">
            Configure your network settings with the form below
          </p>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-center space-x-3">
            <Wifi className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-blue-700">
              All fields marked with * are required
            </p>
          </div>
          <DynamicForm
            fields={networkFields}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkConfigurationForm;