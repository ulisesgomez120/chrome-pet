import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Store } from "lucide-react";

const Popup: React.FC = () => {
  return (
    <div className='min-w-[300px] min-h-[400px] bg-background text-foreground p-4'>
      <Card className='border shadow-sm'>
        <Tabs defaultValue='character' className='w-full'>
          <TabsList className='grid w-full grid-cols-3 h-10'>
            <TabsTrigger value='character' className='data-[state=active]:bg-accent'>
              Pet
            </TabsTrigger>
            <TabsTrigger value='settings' className='data-[state=active]:bg-accent'>
              <Settings className='h-4 w-4' />
            </TabsTrigger>
            <TabsTrigger value='store' className='data-[state=active]:bg-accent'>
              <Store className='h-4 w-4' />
            </TabsTrigger>
          </TabsList>

          <div className='p-4 space-y-4'>
            <TabsContent value='character' className='mt-0'>
              <div className='flex flex-col items-center space-y-4'>
                <div className='w-24 h-24 rounded-full bg-accent flex items-center justify-center'>
                  <span className='text-3xl'>🐱</span>
                </div>

                <div className='text-center'>
                  <h2 className='text-xl font-semibold'>Your Pet Name</h2>
                  <p className='text-sm text-muted-foreground'>Level 1</p>
                </div>

                <div className='w-full space-y-2'>
                  <div className='flex justify-between p-2 bg-accent/50 rounded'>
                    <span className='text-sm font-medium'>Playfulness</span>
                    <span className='text-sm'>70%</span>
                  </div>
                  <div className='flex justify-between p-2 bg-accent/50 rounded'>
                    <span className='text-sm font-medium'>Energy</span>
                    <span className='text-sm'>85%</span>
                  </div>
                  <div className='flex justify-between p-2 bg-accent/50 rounded'>
                    <span className='text-sm font-medium'>Friendship</span>
                    <span className='text-sm'>60%</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value='settings'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Movement Speed</label>
                  <input type='range' min='1' max='100' defaultValue='50' className='w-full' />
                </div>

                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium'>Sound Effects</label>
                  <input type='checkbox' defaultChecked className='h-4 w-4' />
                </div>

                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium'>Follow Tabs</label>
                  <input type='checkbox' className='h-4 w-4' />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='store'>
              <div className='grid grid-cols-2 gap-3'>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className='p-2 bg-secondary rounded-lg flex flex-col items-center'>
                    <div className='w-12 h-12 bg-background rounded-full flex items-center justify-center mb-2'>
                      <span className='text-xl'>🐱</span>
                    </div>
                    <span className='text-xs font-medium'>Pet {item}</span>
                    <button className='mt-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90'>
                      {item === 1 ? "Selected" : "Select"}
                    </button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default Popup;
