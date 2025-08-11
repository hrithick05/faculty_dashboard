import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { achievementTypes } from '../data/mockFaculty';

const TargetTable = ({ target }) => {
  if (!target) return null;
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">Target Achievement (Department)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-tableHeader">
                <TableHead className="font-semibold dark:text-white">Faculty Name</TableHead>
                <TableHead className="font-semibold dark:text-white">Designation</TableHead>
                <TableHead className="font-semibold dark:text-white">Department</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">R&D Proposals (Sangsation)</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">R&D Proposals (Submition)</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Academic Pass %</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Effective Mentoring</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">R&D Funding</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Journal Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Co-Author Journals</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Student Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Book Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Patents</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Online Certifications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Student Projects</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">FDP Works</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">FDP Worps</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Industry Collaborations</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Other Activities</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-accent/10">
                <TableCell className="font-medium font-bold dark:text-white">{target.name}</TableCell>
                <TableCell className="dark:text-white">{target.designation}</TableCell>
                <TableCell className="dark:text-white">{target.department}</TableCell>
                <TableCell className="text-center dark:text-white">{target.rdproposalssangsation || '-'}</TableCell>
                <TableCell className="text-center dark:text-white">{target.rdproposalssubmition || '-'}</TableCell>
                <TableCell className="text-center dark:text-white">{target.academicpasspercentage || '-'}</TableCell>
                <TableCell className="text-center dark:text-white">{target.effectivementoring || '-'}</TableCell>
                <TableCell className="text-center dark:text-white">{target.rdfunding}</TableCell>
                <TableCell className="text-center dark:text-white">{target.journalpublications}</TableCell>
                <TableCell className="text-center dark:text-white">{target.journalscoauthor}</TableCell>
                <TableCell className="text-center dark:text-white">{target.studentpublications}</TableCell>
                <TableCell className="text-center dark:text-white">{target.bookpublications}</TableCell>
                <TableCell className="text-center dark:text-white">{target.patents}</TableCell>
                <TableCell className="text-center dark:text-white">{target.onlinecertifications}</TableCell>
                <TableCell className="text-center dark:text-white">{target.studentprojects}</TableCell>
                <TableCell className="text-center dark:text-white">{target.fdpworks}</TableCell>
                <TableCell className="text-center dark:text-white">{target.fdpworps}</TableCell>
                <TableCell className="text-center dark:text-white">{target.industrycollabs}</TableCell>
                <TableCell className="text-center dark:text-white">{target.otheractivities}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TargetTable;
