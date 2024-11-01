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

            {/* Other TabsContent components remain the same */}
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default Popup;
