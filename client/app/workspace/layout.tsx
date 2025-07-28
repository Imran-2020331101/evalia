import DynamicBreadcrumbs from "@/components/ui/dynamicBreadCrumb";
import CandidatesWorkSpaceMenu from "@/components/workspace/menu/CandidatesWorkSpaceMenu";

const WorkSpaceLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950 h-screen">
      <div className="flex w-full h-full bg-gray-950/90 min-h-0">
        {/* Sidebar */}
        <section className="h-full w-[240px]">
          <CandidatesWorkSpaceMenu />
        </section>

        {/* Main content */}
        <section className="flex-1 h-full mr-[20px] py-[15px]  bg-gray-950/90  min-h-0">
          <div className="h-full w-full flex flex-col border border-gray-800">
            {/* Breadcrumb Header */}
            <div className="h-[40px] shrink-0 border-b border-gray-800 flex justify-center items-center">
              <DynamicBreadcrumbs />
            </div>

            {/* Scrollable Content with padding */}
            <div className="flex-1 overflow-hidden">
              <div className="w-full h-full overflow-y-auto rounded-md">
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorkSpaceLayout;
