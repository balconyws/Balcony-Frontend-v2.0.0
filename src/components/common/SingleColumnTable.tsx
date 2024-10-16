'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ChevronsUpDownIcon, MapPinIcon, UserIcon, ClockIcon } from 'lucide-react';

import { getIconByLabel } from '@/helper';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const sortStringArray = (array: string[], isASC: boolean) =>
  [...array].sort((a, b) => (isASC ? a.localeCompare(b) : b.localeCompare(a)));

type Props = {
  type: 'amenities' | 'location' | 'bookingInfo' | 'serviceHours' | 'workspaceInfo';
  data: string[];
  bodyHeight?: string;
};

const SingleColumnTable: React.FC<Props> = ({ type, data, bodyHeight }: Props) => {
  const [tableState, setTableState] = useState<{ data: string[]; isASC: boolean }>({
    data,
    isASC: false,
  });

  const getHeaderText = useMemo(() => {
    switch (type) {
      case 'amenities':
        return 'amenities';
      case 'location':
        return 'location';
      case 'bookingInfo':
        return 'workspace booking info';
      case 'serviceHours':
        return 'hours of service (time frame)';
      case 'workspaceInfo':
        return 'workspace info';
      default:
        return '';
    }
  }, [type]);

  const getIcon = useCallback(
    (item: string): JSX.Element =>
      type === 'location' ? (
        <MapPinIcon className="text-primary w-5 h-5" />
      ) : type === 'serviceHours' ? (
        <ClockIcon className="text-primary w-5 h-5" />
      ) : type === 'bookingInfo' ? (
        <UserIcon className="text-primary w-5 h-5" />
      ) : type === 'workspaceInfo' ? (
        <>{getIconByLabel('co-workspace, office')}</>
      ) : (
        <>{getIconByLabel(item)}</>
      ),
    [type]
  );

  const handleSort = () => {
    setTableState(prev => ({
      data: !prev.isASC ? sortStringArray(data, true) : data,
      isASC: !prev.isASC,
    }));
  };

  return (
    <Table containerClassName="border-b border-border rounded-b-lg">
      <TableHeader className="border-b border-border bg-tableHeader">
        <TableRow>
          <TableHead className="px-2 rounded-t-lg">
            <Button variant="secondary" size="sm" className="bg-transparent" onClick={handleSort}>
              {getHeaderText}
              <ChevronsUpDownIcon className="text-primary w-3 h-3 ml-2" />
            </Button>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="border-x border-border rounded-b-lg [&_tr:last-child>td]:border-b-0 [&_tr:last-child>td]:rounded-b-lg">
        <ScrollArea
          className={cn(
            'rounded-b-lg',
            type === 'amenities' ? 'max-h-[64vh] lg:max-h-[72vh]' : 'max-h-[24vh] lg:max-h-[32vh]',
            bodyHeight
          )}>
          {tableState.data.map((item, i) => (
            <TableRow key={i} className="border-none">
              <TableCell className="text-primary flex items-center border-b border-b-border">
                {getIcon(item)}
                <span
                  className={`ml-2 text-sm leading-6 ${
                    type === 'location' ? 'text-right' : 'text-left'
                  }`}>
                  {item}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </ScrollArea>
      </TableBody>
    </Table>
  );
};

export default SingleColumnTable;
