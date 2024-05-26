'use client';
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LiaUserEditSolid } from "react-icons/lia";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const Topbar = ({ admin }) => {
  const pathname = usePathname();
  const segments = pathname.split('/').filter((segment) => segment !== '');

  return (
    <section className="py-2 px-4 w-full h-[60px] flex items-center border-b border-[rgba(0,0,0,0.1)] justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          {segments.slice(0, -1).map((segment, index) => (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  href={`/${segments.slice(0, index + 1).join('/')}`}
                >
                  {segment}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{segments[segments.length - 1]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Sheet>
        <SheetTrigger className="focus:outline-none">
          <img
            className="h-[40px] aspect-square rounded-full focus:outline-none border border-[rgba(0,0,0,0.1)] object-cover object-center cursor-pointer"
            src={admin?.data?.data?.admin?.avatar}
            alt={admin?.data?.data?.admin?.name}
          />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className='py-[10px]'>
            <SheetTitle>My profile</SheetTitle>
          </SheetHeader>
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>
                    Make changes to your account here. Click save when you're
                    done.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid gap-4 w-full">
                    <div className="relative">
                      <img
                        className="h-[180px] w-full rounded-[25px] focus:outline-none border border-[rgba(0,0,0,0.1)] object-cover object-center cursor-pointer"
                        src={admin?.data?.data?.admin?.avatar}
                        alt={admin?.data?.data?.admin?.name}
                      />
                      <span className="absolute cursor-pointer bottom-[10px] right-[10px] text-[22px] bg-[rgba(255,255,255,0.75)] rounded-full p-[5px]">
                        <LiaUserEditSolid />
                      </span>
                    </div>
                    <div className="grid grid-cols-4 items-center">
                      <Label htmlFor="name" className="text-center">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={admin?.data?.data?.admin?.name}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center">
                      <Label htmlFor="email" className="text-center">
                        Email
                      </Label>
                      <Input
                        id="email"
                        value={admin?.data?.data?.admin?.email}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center">
                      <Label htmlFor="phone" className="text-center">
                        Phone
                      </Label>
                      <div className="col-span-3 flex gap-[5px]">
                        <Input
                          id="phc"
                          value={admin?.data?.data?.admin?.phoneCountryCode}
                          className="w-[20%]"
                        />
                        <Input
                          id="phone"
                          value={admin?.data?.data?.admin?.phone}
                          className="w-[80%]"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="px-4 pt-2 pb-6 flex justify-end">
                  <Button>Save changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change your password here. After saving, you'll be logged
                    out.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="current">Current password</Label>
                    <Input id="current" type="password" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="new">New password</Label>
                    <Input id="new" type="password" />
                  </div>
                </CardContent>
                <CardFooter className="px-4 pt-2 pb-6 flex justify-end">
                  <Button>Save password</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </section>
  );
};

export default Topbar;
